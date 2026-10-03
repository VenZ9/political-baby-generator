#!/usr/bin/env python3
"""
Harvest the REAL public-figure roster for Political Baby Generator.

For each curated figure this script:
  1. reads the Wikipedia REST summary (portrait thumbnail + short description),
  2. downloads a ~400px portrait into public/portraits/<id>.jpg,
  3. reads the Wikimedia Commons licence metadata for attribution,
  4. emits data/people.ts (typed) and public/portraits/CREDITS.md.

Portraits are downloaded ONCE at build time and served from /public, so the app
never hot-links or scrapes at runtime.

Run:  python3 scripts/harvest_roster.py
"""

from __future__ import annotations

import concurrent.futures as futures
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "portraits")
DATA_FILE = os.path.join(ROOT, "data", "people.ts")
CREDITS_FILE = os.path.join(OUT_DIR, "CREDITS.md")

UA = "PoliticalBabyGenerator/1.0 (parody app; build-time roster harvest)"

# --------------------------------------------------------------------------
# Curated roster: (id, display name, country, Wikipedia title)
# --------------------------------------------------------------------------
ROSTER: list[tuple[str, str, str, str]] = [
    # United States
    ("donald-trump", "Donald Trump", "United States", "Donald Trump"),
    ("joe-biden", "Joe Biden", "United States", "Joe Biden"),
    ("kamala-harris", "Kamala Harris", "United States", "Kamala Harris"),
    ("barack-obama", "Barack Obama", "United States", "Barack Obama"),
    ("bernie-sanders", "Bernie Sanders", "United States", "Bernie Sanders"),
    ("aoc", "Alexandria Ocasio-Cortez", "United States", "Alexandria Ocasio-Cortez"),
    ("hillary-clinton", "Hillary Clinton", "United States", "Hillary Clinton"),
    ("ron-desantis", "Ron DeSantis", "United States", "Ron DeSantis"),
    # United Kingdom
    ("keir-starmer", "Keir Starmer", "United Kingdom", "Keir Starmer"),
    ("rishi-sunak", "Rishi Sunak", "United Kingdom", "Rishi Sunak"),
    ("boris-johnson", "Boris Johnson", "United Kingdom", "Boris Johnson"),
    ("nigel-farage", "Nigel Farage", "United Kingdom", "Nigel Farage"),
    ("theresa-may", "Theresa May", "United Kingdom", "Theresa May"),
    # India
    ("narendra-modi", "Narendra Modi", "India", "Narendra Modi"),
    ("rahul-gandhi", "Rahul Gandhi", "India", "Rahul Gandhi"),
    ("amit-shah", "Amit Shah", "India", "Amit Shah"),
    ("arvind-kejriwal", "Arvind Kejriwal", "India", "Arvind Kejriwal"),
    ("sonia-gandhi", "Sonia Gandhi", "India", "Sonia Gandhi"),
    # Pakistan
    ("imran-khan", "Imran Khan", "Pakistan", "Imran Khan"),
    ("shehbaz-sharif", "Shehbaz Sharif", "Pakistan", "Shehbaz Sharif"),
    ("nawaz-sharif", "Nawaz Sharif", "Pakistan", "Nawaz Sharif"),
    ("bilawal-bhutto", "Bilawal Bhutto Zardari", "Pakistan", "Bilawal Bhutto Zardari"),
    # France
    ("emmanuel-macron", "Emmanuel Macron", "France", "Emmanuel Macron"),
    ("marine-le-pen", "Marine Le Pen", "France", "Marine Le Pen"),
    ("jean-luc-melenchon", "Jean-Luc Mélenchon", "France", "Jean-Luc Mélenchon"),
    ("nicolas-sarkozy", "Nicolas Sarkozy", "France", "Nicolas Sarkozy"),
    # Germany
    ("olaf-scholz", "Olaf Scholz", "Germany", "Olaf Scholz"),
    ("angela-merkel", "Angela Merkel", "Germany", "Angela Merkel"),
    ("friedrich-merz", "Friedrich Merz", "Germany", "Friedrich Merz"),
    ("annalena-baerbock", "Annalena Baerbock", "Germany", "Annalena Baerbock"),
    # Russia
    ("vladimir-putin", "Vladimir Putin", "Russia", "Vladimir Putin"),
    ("dmitry-medvedev", "Dmitry Medvedev", "Russia", "Dmitry Medvedev"),
    ("sergei-lavrov", "Sergei Lavrov", "Russia", "Sergey Lavrov"),
    # China
    ("xi-jinping", "Xi Jinping", "China", "Xi Jinping"),
    ("li-qiang", "Li Qiang", "China", "Li Qiang"),
    ("wang-yi", "Wang Yi", "China", "Wang Yi (politician)"),
    # Brazil
    ("lula", "Luiz Inácio Lula da Silva", "Brazil", "Luiz Inácio Lula da Silva"),
    ("jair-bolsonaro", "Jair Bolsonaro", "Brazil", "Jair Bolsonaro"),
    ("dilma-rousseff", "Dilma Rousseff", "Brazil", "Dilma Rousseff"),
    # Canada
    ("justin-trudeau", "Justin Trudeau", "Canada", "Justin Trudeau"),
    ("pierre-poilievre", "Pierre Poilievre", "Canada", "Pierre Poilievre"),
    ("mark-carney", "Mark Carney", "Canada", "Mark Carney"),
    # Japan
    ("fumio-kishida", "Fumio Kishida", "Japan", "Fumio Kishida"),
    ("shigeru-ishiba", "Shigeru Ishiba", "Japan", "Shigeru Ishiba"),
    ("yoshihide-suga", "Yoshihide Suga", "Japan", "Yoshihide Suga"),
    # Europe (other)
    ("volodymyr-zelenskyy", "Volodymyr Zelenskyy", "Ukraine", "Volodymyr Zelenskyy"),
    ("recep-tayyip-erdogan", "Recep Tayyip Erdoğan", "Türkiye", "Recep Tayyip Erdoğan"),
    ("giorgia-meloni", "Giorgia Meloni", "Italy", "Giorgia Meloni"),
    ("pedro-sanchez", "Pedro Sánchez", "Spain", "Pedro Sánchez"),
    ("viktor-orban", "Viktor Orbán", "Hungary", "Viktor Orbán"),
    ("donald-tusk", "Donald Tusk", "Poland", "Donald Tusk"),
    ("kyriakos-mitsotakis", "Kyriakos Mitsotakis", "Greece", "Kyriakos Mitsotakis"),
    ("mark-rutte", "Mark Rutte", "Netherlands", "Mark Rutte"),
    ("mette-frederiksen", "Mette Frederiksen", "Denmark", "Mette Frederiksen"),
    ("leo-varadkar", "Leo Varadkar", "Ireland", "Leo Varadkar"),
    ("kaja-kallas", "Kaja Kallas", "Estonia", "Kaja Kallas"),
    ("alexander-stubb", "Alexander Stubb", "Finland", "Alexander Stubb"),
    ("ulf-kristersson", "Ulf Kristersson", "Sweden", "Ulf Kristersson"),
    ("jonas-gahr-store", "Jonas Gahr Støre", "Norway", "Jonas Gahr Støre"),
    ("aleksandar-vucic", "Aleksandar Vučić", "Serbia", "Aleksandar Vučić"),
    ("klaus-iohannis", "Klaus Iohannis", "Romania", "Klaus Iohannis"),
    ("robert-fico", "Robert Fico", "Slovakia", "Robert Fico"),
    ("xavier-bettel", "Xavier Bettel", "Luxembourg", "Xavier Bettel"),
    ("karl-nehammer", "Karl Nehammer", "Austria", "Karl Nehammer"),
    ("viola-amherd", "Viola Amherd", "Switzerland", "Viola Amherd"),
    ("antonio-costa", "António Costa", "Portugal", "António Costa"),
    # Middle East / Africa
    ("benjamin-netanyahu", "Benjamin Netanyahu", "Israel", "Benjamin Netanyahu"),
    ("mahmoud-abbas", "Mahmoud Abbas", "Palestine", "Mahmoud Abbas"),
    ("mohammed-bin-salman", "Mohammed bin Salman", "Saudi Arabia", "Mohammed bin Salman"),
    ("abdel-fattah-el-sisi", "Abdel Fattah el-Sisi", "Egypt", "Abdel Fattah el-Sisi"),
    ("masoud-pezeshkian", "Masoud Pezeshkian", "Iran", "Masoud Pezeshkian"),
    ("cyril-ramaphosa", "Cyril Ramaphosa", "South Africa", "Cyril Ramaphosa"),
    ("william-ruto", "William Ruto", "Kenya", "William Ruto"),
    ("paul-kagame", "Paul Kagame", "Rwanda", "Paul Kagame"),
    ("nana-akufo-addo", "Nana Akufo-Addo", "Ghana", "Nana Akufo-Addo"),
    ("bola-tinubu", "Bola Tinubu", "Nigeria", "Bola Tinubu"),
    # Asia-Pacific / Latin America
    ("anthony-albanese", "Anthony Albanese", "Australia", "Anthony Albanese"),
    ("jacinda-ardern", "Jacinda Ardern", "New Zealand", "Jacinda Ardern"),
    ("anwar-ibrahim", "Anwar Ibrahim", "Malaysia", "Anwar Ibrahim"),
    ("joko-widodo", "Joko Widodo", "Indonesia", "Joko Widodo"),
    ("lee-hsien-loong", "Lee Hsien Loong", "Singapore", "Lee Hsien Loong"),
    ("sheikh-hasina", "Sheikh Hasina", "Bangladesh", "Sheikh Hasina"),
    ("aung-san-suu-kyi", "Aung San Suu Kyi", "Myanmar", "Aung San Suu Kyi"),
    ("tsai-ing-wen", "Tsai Ing-wen", "Taiwan", "Tsai Ing-wen"),
    ("ferdinand-marcos-jr", "Ferdinand Marcos Jr.", "Philippines", "Bongbong Marcos"),
    ("kim-jong-un", "Kim Jong Un", "North Korea", "Kim Jong Un"),
    ("nayib-bukele", "Nayib Bukele", "El Salvador", "Nayib Bukele"),
    ("javier-milei", "Javier Milei", "Argentina", "Javier Milei"),
    ("claudia-sheinbaum", "Claudia Sheinbaum", "Mexico", "Claudia Sheinbaum"),
    ("gustavo-petro", "Gustavo Petro", "Colombia", "Gustavo Petro"),
    ("gabriel-boric", "Gabriel Boric", "Chile", "Gabriel Boric"),
    ("nicolas-maduro", "Nicolás Maduro", "Venezuela", "Nicolás Maduro"),
    ("dina-boluarte", "Dina Boluarte", "Peru", "Dina Boluarte"),
    ("luis-lacalle-pou", "Luis Lacalle Pou", "Uruguay", "Luis Lacalle Pou"),
]

# --------------------------------------------------------------------------
# Fictional cartoon trait assignment.
#
# These are PARODY tags for the cartoon mixer. They are assigned
# deterministically from the person's id purely so the roster is stable and
# reproducible. They are NOT measurements, observations or inferences about
# any real person.
# --------------------------------------------------------------------------
HAIR_STYLES = ["bald", "tuft", "curly", "sidepart", "spiky", "bob", "pigtails", "buzz", "mop"]
HAIR_COLORS = ["jet", "chestnut", "auburn", "blonde", "platinum", "ginger", "silver", "candy"]
EYE_COLORS = ["brown", "hazel", "green", "blue", "grey", "violet"]
FACE_SHAPES = ["round", "oval", "square", "heart", "long"]
EYEBROWS = ["soft", "arched", "straight", "bushy", "worried", "bold"]
EXPRESSIONS = ["giggly", "sleepy", "surprised", "cheeky", "serious", "delighted"]

ACCENTS = [
    "#e0483a", "#3f7fd0", "#2fa87a", "#c9a227", "#a855c9", "#d0563f",
    "#4a6fd0", "#2f9fb0", "#8a8f98", "#e07a2f", "#5aa9d6", "#3f9e6a",
    "#c94f8a", "#7a5fd0", "#d4a017", "#c0392b", "#e08a2f", "#4f8fd0",
]


def _rng_for(seed_text: str):
    """Deterministic byte stream from a string (stable across runs)."""
    digest = hashlib.sha256(seed_text.encode("utf-8")).digest()
    counter = 0

    def nxt(n: int) -> int:
        nonlocal counter
        h = hashlib.sha256(digest + counter.to_bytes(4, "big")).digest()
        counter += 1
        return int.from_bytes(h[:4], "big") % n

    return nxt


def traits_for(pid: str) -> dict:
    n = _rng_for("pbg-traits:" + pid)
    return {
        "hairStyle": HAIR_STYLES[n(len(HAIR_STYLES))],
        "hairColor": HAIR_COLORS[n(len(HAIR_COLORS))],
        "eyeColor": EYE_COLORS[n(len(EYE_COLORS))],
        "faceShape": FACE_SHAPES[n(len(FACE_SHAPES))],
        "eyebrowStyle": EYEBROWS[n(len(EYEBROWS))],
        "expression": EXPRESSIONS[n(len(EXPRESSIONS))],
    }


def accent_for(pid: str) -> str:
    n = _rng_for("pbg-accent:" + pid)
    return ACCENTS[n(len(ACCENTS))]


def monogram_for(name: str) -> str:
    parts = [p for p in re.split(r"[\s.]+", name) if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return name[:2].upper()


# --------------------------------------------------------------------------
# Network helpers
# --------------------------------------------------------------------------

def _open(req: urllib.request.Request, timeout: int):
    """urlopen with retry/backoff for 429 and 5xx (Wikimedia rate limits)."""
    last = None
    for attempt in range(5):
        try:
            return urllib.request.urlopen(req, timeout=timeout)
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 500, 502, 503, 504) and attempt < 4:
                time.sleep(2.0 * (attempt + 1))
                continue
            raise
        except urllib.error.URLError as e:
            last = e
            if attempt < 4:
                time.sleep(1.5 * (attempt + 1))
                continue
            raise
    raise last  # type: ignore[misc]


def get_json(url: str, timeout: int = 25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with _open(req, timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_summary(wiki_title: str):
    """Fetch a Wikipedia summary, cached on disk so re-runs are fast and resumable."""
    cache_dir = os.path.join(ROOT, ".cache")
    os.makedirs(cache_dir, exist_ok=True)
    key = hashlib.sha1(wiki_title.encode("utf-8")).hexdigest()[:16]
    cache_file = os.path.join(cache_dir, f"summary-{key}.json")
    if os.path.exists(cache_file):
        try:
            with open(cache_file, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(
        wiki_title.replace(" ", "_"), safe=""
    )
    data = get_json(url)
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data, f)
    except Exception:
        pass
    return data


def commons_credit(thumb_url: str):
    """Return (artist, licence, file_page) for a Commons thumbnail URL."""
    m = re.search(r"/commons/(?:thumb/)?[0-9a-f]/[0-9a-f]{2}/([^/]+)/", thumb_url)
    if not m:
        return None, None, None
    filename = urllib.parse.unquote(m.group(1))
    api = (
        "https://commons.wikimedia.org/w/api.php?action=query&format=json"
        "&prop=imageinfo&iiprop=extmetadata|url&titles="
        + urllib.parse.quote("File:" + filename, safe="")
    )
    try:
        data = get_json(api)
        pages = data.get("query", {}).get("pages", {})
        for _, page in pages.items():
            info = (page.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata") or {}
            artist = re.sub(r"<[^>]+>", "", (meta.get("Artist") or {}).get("value", "") or "").strip()
            licence = (meta.get("LicenseShortName") or {}).get("value", "") or ""
            page_url = info.get("descriptionurl") or (
                "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(filename)
            )
            return artist or None, licence or None, page_url
    except Exception:
        pass
    return None, None, None


def download(url: str, dest: str) -> int:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with _open(req, 40) as r:
        blob = r.read()
    with open(dest, "wb") as f:
        f.write(blob)
    return len(blob)


def portrait_url(thumb: str, width: int = 500) -> str:
    """Rewrite a Wikimedia thumb URL to a valid width (500 is in the allowed set)."""
    return re.sub(r"/\d+px-", f"/{width}px-", thumb)


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def process(entry):
    pid, name, country, wiki = entry
    dest = os.path.join(OUT_DIR, f"{pid}.jpg")
    have_file = os.path.exists(dest) and os.path.getsize(dest) > 5000

    try:
        summary = fetch_summary(wiki)
    except Exception as e:  # noqa: BLE001
        if have_file:
            return {"id": pid, "name": name, "country": country, "image": f"/portraits/{pid}.jpg",
                    "role": "Public figure", "bytes": os.path.getsize(dest),
                    "credit": {"artist": None, "licence": None, "page": None}}
        return {"id": pid, "name": name, "error": f"summary failed: {e}"}

    thumb = (summary.get("thumbnail") or {}).get("source")
    if not thumb and not have_file:
        return {"id": pid, "name": name, "error": "no thumbnail on Wikipedia"}

    if not have_file:
        url = portrait_url(thumb, 500)
        try:
            size = download(url, dest)
        except Exception as e:  # noqa: BLE001
            return {"id": pid, "name": name, "error": f"download failed: {e}"}
    else:
        size = os.path.getsize(dest)

    artist, licence, page_url = commons_credit(thumb) if thumb else (None, None, None)
    return {
        "id": pid,
        "name": name,
        "country": country,
        "role": (summary.get("description") or "Public figure").strip(),
        "image": f"/portraits/{pid}.jpg",
        "bytes": size,
        "credit": {"artist": artist, "licence": licence, "page": page_url},
    }


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    results = []
    with futures.ThreadPoolExecutor(max_workers=1) as pool:
        for res in pool.map(process, ROSTER):
            results.append(res)
            status = res.get("error") or f"{res.get('bytes', 0) // 1024} KB"
            print(f"  {res['id']:<26} {status}", flush=True)
            time.sleep(0.8)

    ok = [r for r in results if not r.get("error")]
    bad = [r for r in results if r.get("error")]
    print(f"\n{len(ok)}/{len(ROSTER)} portraits downloaded; {len(bad)} failed")
    for b in bad:
        print(f"  FAILED {b['id']}: {b['error']}")

    # Include any previously-downloaded portrait whose metadata we could not
    # re-fetch this run, so a partial run never drops a figure from the roster.
    seen = {r["id"] for r in ok}
    for pid, name, country, _wiki in ROSTER:
        if pid in seen:
            continue
        dest = os.path.join(OUT_DIR, f"{pid}.jpg")
        if os.path.exists(dest) and os.path.getsize(dest) > 5000:
            ok.append({
                "id": pid, "name": name, "country": country,
                "role": "Public figure", "image": f"/portraits/{pid}.jpg",
                "bytes": os.path.getsize(dest),
                "credit": {"artist": None, "licence": None, "page": None},
            })
            seen.add(pid)
    ok.sort(key=lambda r: [e[0] for e in ROSTER].index(r["id"]))

    # ---- emit data/people.ts ----
    lines = [
        'import type { Person } from "@/types";',
        "",
        "/**",
        " * REAL public-figure roster.",
        " *",
        " * Names, countries, roles and portraits are real and sourced from Wikipedia /",
        " * Wikimedia Commons (see public/portraits/CREDITS.md for per-image attribution).",
        " *",
        " * The `traits` on each entry are FICTIONAL PARODY TAGS used only to seed the",
        " * cartoon mixer. They are assigned deterministically from the person's id so the",
        " * roster is stable and reproducible. They are NOT measurements, observations or",
        " * inferences about any real person, and they model no biological, genetic,",
        " * ethnic, health, intellectual or personality characteristic.",
        " *",
        " * Regenerate with: python3 scripts/harvest_roster.py",
        " */",
        "export const PEOPLE: Person[] = [",
    ]
    for r in ok:
        t = traits_for(r["id"])
        lines.append("  {")
        lines.append(f'    id: {json.dumps(r["id"])},')
        lines.append(f'    name: {json.dumps(r["name"], ensure_ascii=False)},')
        lines.append(f'    country: {json.dumps(r["country"], ensure_ascii=False)},')
        lines.append(f'    role: {json.dumps(r["role"], ensure_ascii=False)},')
        lines.append(f'    image: {json.dumps(r["image"])},')
        lines.append(f'    monogram: {json.dumps(monogram_for(r["name"]))},')
        lines.append(f'    accent: {json.dumps(accent_for(r["id"]))},')
        lines.append("    traits: {")
        for k in ("hairStyle", "hairColor", "eyeColor", "faceShape", "eyebrowStyle", "expression"):
            lines.append(f'      {k}: {json.dumps(t[k])},')
        lines.append("    },")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"wrote {DATA_FILE} ({len(ok)} entries)")

    # ---- emit CREDITS.md ----
    cl = [
        "# Portrait credits",
        "",
        "Portraits are downloaded at build time from **Wikimedia Commons** and served",
        "locally from `/public/portraits`. They are used here to identify the public",
        "figures a user may select in this parody app.",
        "",
        "Each image remains the property of its author and is used under the licence",
        "stated below. Where a licence requires attribution, the author is credited.",
        "",
        "| Figure | Author | Licence | Source |",
        "| --- | --- | --- | --- |",
    ]
    for r in ok:
        c = r["credit"]
        artist = (c.get("artist") or "Unknown").replace("|", "/")[:80]
        licence = (c.get("licence") or "See source").replace("|", "/")
        page = c.get("page") or ""
        cl.append(f'| {r["name"]} | {artist} | {licence} | [Commons]({page}) |')
    cl.append("")
    with open(CREDITS_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(cl))
    print(f"wrote {CREDITS_FILE}")

    return 0 if not bad else 1


if __name__ == "__main__":
    sys.exit(main())
