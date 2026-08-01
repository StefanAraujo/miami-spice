#!/usr/bin/env python3
"""
Miami Spice full extractor.

Stage 1: pull every record for programIds:273 from Algolia (listings + coupons)
Stage 2: fetch each listing detail page, cache raw HTML, parse menus + contact
Stage 3: merge into a single restaurants.json

Politeness: 3 workers, ~0.6s between requests per worker, identifying UA,
raw HTML cached to disk so re-runs never re-fetch.
"""

import json, os, re, time, html as htmllib
from concurrent.futures import ThreadPoolExecutor
import requests
from bs4 import BeautifulSoup

APP_ID = "Y72ZZU5PH1"
API_KEY = "9202ce3334a71865cdd5e6c352118144"
PROGRAM = "273"                       # Miami Spice
BASE = "https://www.miamiandbeaches.com"
UA = "SpiceBot/1.0 (personal project; contact: you@example.com)"
CACHE = "cache"
DELAY = 0.6
WORKERS = 3

os.makedirs(CACHE, exist_ok=True)
session = requests.Session()
session.headers.update({"User-Agent": UA})


# ---------- stage 1: index ----------

def fetch_index():
    url = (f"https://{APP_ID.lower()}-dsn.algolia.net/1/indexes/*/queries"
           f"?x-algolia-api-key={API_KEY}&x-algolia-application-id={APP_ID}")
    body = {"requests": [{
        "indexName": "prd-item_name-asc",
        "filters": f"programIds:{PROGRAM}",
        "hitsPerPage": 1000,
        "page": 0,
        "query": "",
    }]}
    r = session.post(url, json=body, timeout=30)
    r.raise_for_status()
    return r.json()["results"][0]["hits"]


# ---------- stage 2: detail pages ----------

def get_page(page_url):
    slug = page_url.strip("/").replace("/", "_") + ".html"
    path = os.path.join(CACHE, slug)
    if os.path.exists(path) and os.path.getsize(path) > 5000:
        return open(path, encoding="utf-8").read()
    time.sleep(DELAY)
    r = session.get(BASE + page_url, timeout=30)
    r.raise_for_status()
    open(path, "w", encoding="utf-8").write(r.text)
    return r.text


def clean(s):
    return re.sub(r"\s+", " ", htmllib.unescape(s or "")).strip()


def parse_jsonld(soup):
    """schema.org LocalBusiness -> address / phone / images."""
    out = {}
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string or "")
        except Exception:
            continue
        for node in (data if isinstance(data, list) else [data]):
            if not isinstance(node, dict):
                continue
            if node.get("@type") in ("LocalBusiness", "Restaurant"):
                addr = node.get("address") or {}
                out["street"] = addr.get("streetAddress")
                out["city"] = addr.get("addressLocality")
                out["state"] = addr.get("addressRegion")
                out["zip"] = addr.get("postalCode")
                out["phone"] = node.get("telephone")
                imgs = node.get("image")
                out["images"] = imgs if isinstance(imgs, list) else ([imgs] if imgs else [])
    return out


def parse_links(soup):
    """Reservation + official website buttons."""
    out = {}
    for a in soup.select(".info-buttons a[href]"):
        label = clean(a.get_text()).lower()
        if "reserv" in label:
            out["reservations_url"] = a["href"]
        elif "website" in label:
            out["website"] = a["href"]
    return out


def parse_days_table(soup):
    """PARTICIPATING DAYS -> {'Lunch $40': ['MON','TUE',...]}"""
    spice = soup.select_one("#profile-spice")
    if not spice:
        return {}
    table = spice.find("table")
    if not table:
        return {}
    heads = [clean(th.get_text()) for th in table.select("thead th")][1:]
    out = {}
    for tr in table.select("tbody tr"):
        cells = tr.find_all(["td", "th"])
        if not cells:
            continue
        label = clean(cells[0].get_text())
        days = [heads[i] for i, c in enumerate(cells[1:])
                if i < len(heads) and clean(c.get_text())]
        if label:
            out[label] = days
    return out


def parse_menus(soup):
    """
    Panels have ids like lunch-40menu / dinner-65menu / brunch-40menu.
    Each contains groups: name, 'Choose N of the following', then items.
    """
    menus = []
    for panel in soup.find_all("div", id=re.compile(r"^(lunch|dinner|brunch)-\d+menu$", re.I)):
        meal, price = re.match(r"^(\w+)-(\d+)menu$", panel["id"], re.I).groups()
        courses = []
        for g in panel.select(".ys-partner-details__tabs__container__info__temptation__group"):
            name_el = g.select_one(".ys-partner-details__tabs__container__info__temptation__group__name")
            desc_el = g.select_one(".ys-partner-details__tabs__container__info__temptation__group__description")
            items = []
            for it in g.select(".ys-partner-details__tabs__container__info__temptation__group__items__item"):
                n = it.select_one(".item-name")
                d = it.select_one(".item-description")
                if n and clean(n.get_text()):
                    items.append({"dish": clean(n.get_text()),
                                  "note": clean(d.get_text()) if d else ""})
            choose_txt = clean(desc_el.get_text()) if desc_el else ""
            m = re.search(r"choose\s+(\d+)", choose_txt, re.I)
            if items:
                courses.append({
                    "course": clean(name_el.get_text()) if name_el else "",
                    "choose": int(m.group(1)) if m else 1,
                    "items": items,
                })
        if courses:
            menus.append({"meal": meal.capitalize(), "price": int(price), "courses": courses})
    return menus


def parse_detail(page_url):
    soup = BeautifulSoup(get_page(page_url), "html.parser")
    rec = {}
    rec.update(parse_jsonld(soup))
    rec.update(parse_links(soup))
    rec["participating_days"] = parse_days_table(soup)
    rec["menus"] = parse_menus(soup)
    mich = soup.find(string=re.compile(r"Michelin Guide.s Point of View", re.I))
    if mich:
        blk = mich.find_parent()
        if blk and blk.parent:
            txt = clean(blk.parent.get_text())
            rec["michelin_note"] = txt[:600]
    return rec


# ---------- stage 3: merge ----------

def main():
    hits = fetch_index()
    listings = [h for h in hits if h.get("type") == "listing"]
    coupons = [h for h in hits if h.get("type") == "coupon"]
    print(f"index: {len(listings)} listings, {len(coupons)} coupons")

    offers_by_account = {}
    for c in coupons:
        offers_by_account.setdefault(c.get("accountID"), []).append({
            "title": c.get("name"),
            "url": BASE + c.get("pageUrl", ""),
            "description_html": c.get("description"),
            "dates": c.get("dates"),
        })

    def build(l):
        base = {
            "id": l.get("itemID"),
            "account_id": l.get("accountID"),
            "name": l.get("name"),
            "url": BASE + (l.get("pageUrl") or ""),
            "neighborhoods": l.get("regions") or [],
            "cuisines": l.get("cuisineTypes") or [],
            "price_tier": l.get("priceValue"),
            "price_range": l.get("priceRange"),
            "lat": (l.get("_geoloc") or [{}])[0].get("lat"),
            "lng": (l.get("_geoloc") or [{}])[0].get("lng"),
            "dietary": l.get("dietaryNeeds") or [],
            "michelin": l.get("michelinDesignation") or "",
            "outdoor_dining": l.get("outdoorDining"),
            "accessibility": l.get("accessibility") or [],
            "amenities": l.get("amenities") or [],
            "spice_schedule": (l.get("spiceMeals") or {}).get("lvl1", []),
            "meals": l.get("meals") or [],
            "blurb": clean(re.sub(r"<[^>]+>", " ", l.get("description") or "")),
            "hero_image": l.get("image"),
            "special_offers": offers_by_account.get(l.get("accountID"), []),
        }
        try:
            base.update(parse_detail(l["pageUrl"]))
            base["scrape_ok"] = True
        except Exception as e:
            base["scrape_ok"] = False
            base["scrape_error"] = str(e)[:200]
        return base

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        out = list(ex.map(build, listings))

    out.sort(key=lambda r: r["name"] or "")
    payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": BASE + "/deals/spice-restaurant-months",
        "count": len(out),
        "restaurants": out,
    }
    with open("restaurants.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1, ensure_ascii=False)

    ok = sum(1 for r in out if r["scrape_ok"])
    withmenu = sum(1 for r in out if r.get("menus"))
    print(f"done: {len(out)} records, {ok} pages ok, {withmenu} with parsed menus")


if __name__ == "__main__":
    main()


# ---------- reservation platform normalization ----------

PLATFORMS = {
    "opentable.com": "OpenTable",
    "resy.com": "Resy",
    "sevenrooms.com": "SevenRooms",
    "exploretock.com": "Tock",
    "toasttab.com": "Toast",
    "yelp.com": "Yelp",
    "google.com": "Google Reserve",
    "wa.me": "WhatsApp",
    "linktr.ee": "Linktree",
    "instagram.com": "Instagram",
}


def reservation_platform(url):
    """-> ('OpenTable' | 'Direct' | None). Direct = books on own site."""
    if not url:
        return None
    import urllib.parse as up
    host = up.urlparse(url).netloc.lower().replace("www.", "")
    for dom, label in PLATFORMS.items():
        if host == dom or host.endswith("." + dom):
            return label
    return "Direct"
