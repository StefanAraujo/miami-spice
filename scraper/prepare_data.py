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


def slugify(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def build_serves(participating_days):
    """
    {"Dinner $65": ["MON","TUE"]} -> (
        ["dinner@MON", "dinner@TUE"],
        [{"meal": "dinner", "price": 65, "days": ["MON","TUE"]}],
    )
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


def clean_items(names):
    return [n for n in names if n and not INSTRUCTION.match(n)]


def flatten_menus(menus):
    """Compact menu + a flat dish list for the search index."""
    out, dishes = [], []
    for m in menus or []:
        courses = []
        for c in m.get("courses") or []:
            names = clean_items([i["dish"] for i in c.get("items", []) if i.get("dish")])
            dishes += names
            courses.append({
                "name": c.get("course", ""),
                "choose": c.get("choose", 1),
                "of": len(names),
                "items": names,
            })
        if courses:
            out.append({"meal": m["meal"].lower(), "price": m.get("price"), "courses": courses})
    return out, dishes


def transform(r):
    serves, offers = build_serves(r.get("participating_days"))
    menus, dishes = flatten_menus(r.get("menus"))
    prices = sorted({o["price"] for o in offers if o["price"]})
    addr = ", ".join(x for x in [r.get("street"), r.get("city"), r.get("state")] if x)

    return {
        "id": r["id"],
        "slug": slugify(r["name"]),
        "name": r["name"],
        "url": r["url"],
        # location
        "hood": (r.get("neighborhoods") or [None])[0],
        "hoods": r.get("neighborhoods") or [],
        "address": addr,
        "zip": r.get("zip"),
        "lat": r.get("lat"),
        "lng": r.get("lng"),
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
        "maps": (f"https://www.google.com/maps/dir/?api=1&destination={r['lat']},{r['lng']}"
                 if r.get("lat") else None),
        "gsearch": f"https://www.google.com/maps/search/?api=1&query={r['name']} {addr}".replace(" ", "+"),
        "yelp": f"https://www.yelp.com/search?find_desc={r['name']}&find_loc=Miami,+FL".replace(" ", "+"),
    }


def main():
    src = json.loads(SRC.read_text(encoding="utf-8"))
    rows = [transform(r) for r in src["restaurants"]]
    rows.sort(key=lambda r: r["name"])

    facets = {
        "cuisines": sorted({c for r in rows for c in r["cuisines"]}),
        "hoods": sorted({h for r in rows for h in r["hoods"]}),
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
