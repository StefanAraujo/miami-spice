#!/usr/bin/env python3
"""
Stage 2 of the pipeline: restaurants.json -> app/src/data/spice.json

Turns the scraped records into a flat, denormalized shape the frontend can
filter with pure set-membership tests. The key move is the `serves` array of
`meal@DAY` composite tokens, which collapses the (day x meal) question into
single tokens. "Italian serving lunch AND dinner on Saturday" becomes:

    cuisines includes "Italian"
      and serves includes "lunch@SAT"
      and serves includes "dinner@SAT"

No nested traversal at query time. Run after spice_extract.py.
"""

import json, re, sys, unicodedata
from pathlib import Path

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "restaurants.json")
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "spice.json")

DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
DAY_NAME = {
    "monday": "MON", "tuesday": "TUE", "wednesday": "WED", "thursday": "THU",
    "friday": "FRI", "saturday": "SAT", "sunday": "SUN",
}


# City is a coarser location axis than neighborhood (23 raw values, but several are
# spelling/case variants of the same place). Normalize so the facet isn't polluted
# with "Sunny Isles" vs "Sunny Isles Beach" or "MIAMI" vs "Miami".
CITY_ALIASES = {"sunny isles": "Sunny Isles Beach", "acentura": "Aventura"}


def norm_city(c):
    if not c:
        return None
    c = " ".join(str(c).split()).strip()
    if not c:
        return None
    key = c.lower()
    if key in CITY_ALIASES:
        return CITY_ALIASES[key]
    return c.title() if c.isupper() or c.islower() else c


def sane_coords(lat, lng):
    """A few records geocoded to Canada / LA / Kentucky. Keep only coordinates
    inside the Greater Miami bounding box; null the rest so the map and any
    distance sort never place a Miami restaurant in another state."""
    try:
        lat, lng = float(lat), float(lng)
    except (TypeError, ValueError):
        return None, None
    if 25.2 < lat < 26.2 and -80.7 < lng < -80.0:
        return lat, lng
    return None, None


def slugify(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def _serves_from_participating(participating_days):
    """
    Legacy path: {"Dinner $65": ["MON","TUE"]} -> serves/offers. Kept only as a
    fallback for the ~7 records with no spice_schedule (see build_serves).
    """
    serves, offers = [], []
    for label, days in (participating_days or {}).items():
        m = re.match(r"\s*(\w+)\s*\$?(\d+)?", label or "")
        if not m:
            continue
        meal = m.group(1).lower()
        price = int(m.group(2)) if m.group(2) else None
        days = [d for d in (days or []) if d in DAYS]
        if not days:
            continue
        serves += [f"{meal}@{d}" for d in days]
        offers.append({"meal": meal, "price": price, "days": days})
    return sorted(set(serves)), offers


def build_serves(r):
    """
    Availability comes from spice_schedule, NOT participating_days.

    participating_days is scraped from the detail-page day table, and that scrape
    is wrong: unavailable days are marked with a dash, which the scraper reads as
    "present," so ~99% of records list all seven days (this is why 107 Steak and
    Bar showed a Sunday it does not serve). spice_schedule is the Algolia field and
    matches the live site exactly; it ties day -> meal -> price in one string:

        "Saturday > Dinner $65"  ->  serves "dinner@SAT", offer {dinner, 65, [SAT]}

    Offers are grouped by (meal, price) so a meal with two price tiers stays two
    offers. Falls back to the legacy table only when spice_schedule is empty.
    """
    sched = r.get("spice_schedule") or []
    serves, grouped = [], {}
    for entry in sched:
        m = re.match(r"\s*([A-Za-z]+)\s*>\s*(\w+)\s*\$?(\d+)?", entry or "")
        if not m:
            continue
        day = DAY_NAME.get(m.group(1).lower())
        if not day:
            continue
        meal = m.group(2).lower()
        price = int(m.group(3)) if m.group(3) else None
        serves.append(f"{meal}@{day}")
        grouped.setdefault((meal, price), set()).add(day)
    if not grouped:
        return _serves_from_participating(r.get("participating_days"))
    offers = [{"meal": meal, "price": price, "days": sorted(days, key=DAYS.index)}
              for (meal, price), days in grouped.items()]
    return sorted(set(serves)), offers


def build_flags(r):
    flags = []
    if r.get("outdoor_dining"):
        flags.append("outdoor")
    if r.get("michelin"):
        flags.append("michelin")
    if r.get("special_offers"):
        flags.append("special-offer")
    if r.get("takes_reservations"):
        flags.append("reservations")
    for d in r.get("dietary") or []:
        tag = slugify(re.sub(r"\(.*?\)", "", d))
        if tag and tag != "none-not-applicable":
            flags.append(tag)
    for a in r.get("accessibility") or []:
        if "wheelchair" in a.lower():
            flags.append("wheelchair")
    return sorted(set(flags))


# Some partner menus paste their instruction line in as if it were a dish
# ("Choose one of the following"). It is not food, it pollutes the search
# index, and it renders as a phantom item in the course ladder.
INSTRUCTION = re.compile(
    r"^\s*(please\s+)?(choose|select|pick)\b[^.]{0,40}?"
    r"\b(following|one|two|three|1|2|3|item|items|option|options|any)\b[\s:.\-–]*$",
    re.I,
)


# About a third of dish names arrive SHOUTED because each partner types their
# menu into the CMS however they like. Rendered as-is the ladder looks broken —
# half the menus in caps, half in sentence case. Normalize only items that are
# entirely uppercase; leave mixed-case text exactly as the restaurant wrote it.
LOWER_WORDS = {
    "a", "agli", "ai", "al", "alla", "alle", "and", "au", "aux", "con", "da",
    "de", "dei", "del", "della", "delle", "di", "du", "e", "el", "en", "et",
    "in", "la", "le", "les", "lo", "of", "on", "or", "su", "the", "to", "un",
    "una", "with", "y",
}
KEEP_UPPER = {"BBQ", "BLT", "NY", "AAA", "USDA", "IPA", "XO", "PEI", "II", "III"}


def smart_title(s):
    def fix(word):
        core = word.strip("()[]{}\"'.,:;!?&/-")
        if core in KEEP_UPPER or (len(core) > 1 and any(ch.isdigit() for ch in core)):
            return word
        return word.capitalize()

    words = [fix(w) for w in s.split(" ")]
    out = []
    for i, w in enumerate(words):
        low = w.lower()
        if 0 < i < len(words) - 1 and low.strip("().,") in LOWER_WORDS:
            out.append(low)
        else:
            out.append(w)
    return " ".join(out)


def normalize_case(s):
    letters = [c for c in s if c.isalpha()]
    if len(letters) > 3 and all(c.isupper() for c in letters):
        return smart_title(s)
    return s


def clean_items(names):
    return [normalize_case(n) for n in names if n and not INSTRUCTION.match(n)]


def clean_note(s):
    """A dish description note: trim and collapse whitespace, drop empties.

    Kept out of the search `dishes` list on purpose — indexing descriptions would
    let a free-text query match a word that never appears in any dish *name*
    (e.g. an Italian spot whose note mentions "sashimi"), which the facet+text
    tests treat as a contradiction. Notes are display-only."""
    return " ".join((s or "").split())


def flatten_menus(menus):
    """Compact menu + a flat dish list for the search index.

    Each course item is an object {name, note?} so the UI can show *what a dish is*
    (a per-dish description present on ~90% of source items), not just its name.
    The detail popup (MenuSheet) reads `note`; the row teaser reads `name`."""
    out, dishes = [], []
    for m in menus or []:
        courses = []
        for c in m.get("courses") or []:
            items = []
            for i in c.get("items", []):
                dish = i.get("dish")
                if not dish or INSTRUCTION.match(dish):
                    continue
                name = normalize_case(dish)
                note = clean_note(i.get("note"))
                items.append({"name": name, "note": note} if note else {"name": name})
                dishes.append(name)
            courses.append({
                "name": c.get("course", ""),
                "choose": c.get("choose", 1),
                "of": len(items),
                "items": items,
            })
        if courses:
            out.append({"meal": m["meal"].lower(), "price": m.get("price"), "courses": courses})
    return out, dishes


def transform(r):
    serves, offers = build_serves(r)
    menus, dishes = flatten_menus(r.get("menus"))
    prices = sorted({o["price"] for o in offers if o["price"]})
    addr = ", ".join(x for x in [r.get("street"), r.get("city"), r.get("state")] if x)
    lat, lng = sane_coords(r.get("lat"), r.get("lng"))

    return {
        "id": r["id"],
        "slug": slugify(r["name"]),
        "name": r["name"],
        "url": r["url"],
        # location
        "hood": (r.get("neighborhoods") or [None])[0],
        "hoods": r.get("neighborhoods") or [],
        "city": norm_city(r.get("city")),
        "address": addr,
        "zip": r.get("zip"),
        "lat": lat,
        "lng": lng,
        "phone": r.get("phone"),
        # classification
        "cuisines": r.get("cuisines") or [],
        "tier": r.get("price_tier"),
        "michelin": r.get("michelin") or None,
        "flags": build_flags(r),
        # availability -- the important part
        "serves": serves,
        "offers": offers,
        "meals": sorted({o["meal"] for o in offers}),
        "days": sorted({d for o in offers for d in o["days"]}, key=DAYS.index),
        "prices": prices,
        "min_price": prices[0] if prices else None,
        "max_price": prices[-1] if prices else None,
        # content
        "blurb": (r.get("blurb") or "")[:400],
        "menus": menus,
        "dish_text": " ".join(sorted(set(dishes))),
        "image": r.get("hero_image"),
        # outbound links -- no API keys needed for any of these
        "reserve": r.get("reservations_url"),
        "platform": r.get("reservation_platform"),
        "website": r.get("website"),
        "maps": (f"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}"
                 if lat is not None else None),
        "gsearch": f"https://www.google.com/maps/search/?api=1&query={r['name']} {addr}".replace(" ", "+"),
        "yelp": f"https://www.yelp.com/search?find_desc={r['name']}&find_loc=Miami,+FL".replace(" ", "+"),
    }


def dedupe(rows):
    """Drop CMS double-listings — the same place under two Algolia ids (e.g. Il
    Pastaio di Eataly, ids 61161/61162: identical name, address, schedule, menus).
    Identity is (name, address); genuine same-name chains at different addresses are
    kept. Keep the record with the most menu depth, then the lowest id, so the choice
    is deterministic across re-scrapes."""
    best = {}
    for r in rows:
        key = (r["name"].strip().lower(), (r.get("address") or "").strip().lower())
        depth = sum(c["of"] for m in r.get("menus", []) for c in m["courses"])
        prev = best.get(key)
        if prev is None or (depth, -r["id"]) > (prev["_depth"], -prev["id"]):
            r["_depth"] = depth
            best[key] = r
    for r in best.values():
        r.pop("_depth", None)
    return list(best.values())


def main():
    src = json.loads(SRC.read_text(encoding="utf-8"))
    rows = dedupe([transform(r) for r in src["restaurants"]])
    rows.sort(key=lambda r: r["name"])

    facets = {
        "cuisines": sorted({c for r in rows for c in r["cuisines"]}),
        "hoods": sorted({h for r in rows for h in r["hoods"]}),
        "cities": sorted({r["city"] for r in rows if r["city"]}),
        "meals": sorted({m for r in rows for m in r["meals"]}),
        "days": DAYS,
        "prices": sorted({p for r in rows for p in r["prices"]}),
        "flags": sorted({f for r in rows for f in r["flags"]}),
        "platforms": sorted({r["platform"] for r in rows if r["platform"]}),
    }

    payload = {
        "generated_at": src.get("generated_at"),
        "count": len(rows),
        "facets": facets,
        "restaurants": rows,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    print(f"wrote {OUT} ({OUT.stat().st_size/1e6:.2f} MB, {len(rows)} restaurants)")
    print("facet sizes:", {k: len(v) for k, v in facets.items()})
    print("sample serves:", rows[0]["name"], rows[0]["serves"][:6])


if __name__ == "__main__":
    main()
