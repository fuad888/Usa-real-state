"""Load the fictional demo dataset from spec §14.

    python manage.py seed_demo_data [--flush]

Every address, agent and statistic below is invented for the client pitch — none
of it refers to a real listing or a real person.

Listing photos are stock/sample imagery (royalty-free Unsplash photos, not the
actual fictional houses) so the demo has something to show; agent/community
image fields are still left blank and fall back to the branded gradient
placeholder. Real photography replaces any of this in Phase 1 through the
Django admin — the moment a value exists, the frontend renders it as-is.
"""

from datetime import datetime, timedelta, timezone

from django.core.management.base import BaseCommand
from django.db import transaction

from agents.models import Agent
from communities.models import Community
from insights.models import Article
from properties.models import Property, PropertyImage, PropertyTour

NOW = datetime.now(timezone.utc)


def _unsplash(photo_id: str, width: int = 1600) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w={width}&q=80&auto=format&fit=crop"


# Sample stock photography, cycled across listings for variety. Not photos of
# the fictional addresses above — swapped for real photography in Phase 1.
_EXTERIOR_IMAGES = [
    _unsplash("1600585154340-be6161a56a0c"),
    _unsplash("1600585154526-990dced4db0d"),
    _unsplash("1591474200742-8e512e6f98f8"),
    _unsplash("1600047509807-ba8f99d2cdde"),
]
_LIVING_ROOM_IMAGES = [
    _unsplash("1600566753086-00f18fb6b3ea"),
    _unsplash("1616486338812-3dadae4b4ace"),
    _unsplash("1600210491892-03d54c0aaf87"),
    _unsplash("1600210492486-724fe5c67fb0"),
]
_KITCHEN_IMAGES = [
    _unsplash("1556909212-d5b604d0c90d"),
    _unsplash("1600607687920-4e2a09cf159d"),
]
_ROOM_IMAGES = {
    "Primary Suite": _unsplash("1540518614846-7eded433c457"),
    "Pool": _unsplash("1613490493576-7fde63acd811"),
    "Garden": _unsplash("1585320806297-9794b3e4eeae"),
    "Terrace": _unsplash("1613490493576-7fde63acd811"),
    "Roof Deck": _unsplash("1613490493576-7fde63acd811"),
}


def image_url_for(room: str, listing_index: int) -> str:
    if room == "Exterior":
        return _EXTERIOR_IMAGES[listing_index % len(_EXTERIOR_IMAGES)]
    if room == "Living Room":
        return _LIVING_ROOM_IMAGES[listing_index % len(_LIVING_ROOM_IMAGES)]
    if room == "Kitchen":
        return _KITCHEN_IMAGES[listing_index % len(_KITCHEN_IMAGES)]
    return _ROOM_IMAGES.get(room, "")

AGENTS = [
    dict(
        name="Elena Marchetti", slug="elena-marchetti", title="Founding Partner · DRE #01998xxx",
        photo_url="", phone="(310) 555-0142",
        email="elena@solandstone.example", license_number="DRE #01998xxx",
        specialties=["Trophy Estates", "Architectural Homes", "Off-Market Sales"],
        neighborhoods=["Beverly Hills", "Bel Air", "Holmby Hills"],
        career_stats={"total_sales_volume": "$412M", "homes_sold": 168, "years_experience": 14,
                      "avg_days_on_market": 27},
        bio_en=(
            "Elena founded Sol & Stone after fourteen years representing architecturally "
            "significant homes on the Westside. She is known for quiet, discreet transactions "
            "and for a marketing approach that treats every listing as an editorial subject "
            "rather than an inventory item."
        ),
        bio_es=(
            "Elena fundó Sol & Stone tras catorce años representando casas de valor "
            "arquitectónico en el Westside. Es conocida por transacciones discretas y por un "
            "enfoque de marketing que trata cada propiedad como un tema editorial."
        ),
        order=1,
    ),
    dict(
        name="David Okonkwo", slug="david-okonkwo", title="Partner · Coastal Division",
        photo_url="", phone="(310) 555-0177",
        email="david@solandstone.example", license_number="DRE #02043xxx",
        specialties=["Oceanfront", "New Development", "1031 Exchanges"],
        neighborhoods=["Malibu", "Pacific Palisades", "Santa Monica"],
        career_stats={"total_sales_volume": "$286M", "homes_sold": 94, "years_experience": 11,
                      "avg_days_on_market": 34},
        bio_en=(
            "David leads the coastal practice, from Carbon Beach to the Palisades bluffs. A "
            "former land-use analyst, he is the person clients call when a property's value "
            "turns on a coastal permit, a setback or a view easement."
        ),
        bio_es=(
            "David dirige la práctica costera, desde Carbon Beach hasta los acantilados de "
            "Palisades. Ex analista de uso de suelo, es a quien llaman los clientes cuando el "
            "valor depende de un permiso costero o una servidumbre de vistas."
        ),
        order=2,
    ),
    dict(
        name="Camila Reyes", slug="camila-reyes", title="Senior Advisor",
        photo_url="", phone="(818) 555-0190",
        email="camila@solandstone.example", license_number="DRE #02110xxx",
        specialties=["Family Estates", "Relocation", "Bilingual Representation"],
        neighborhoods=["Calabasas", "Hidden Hills", "Studio City"],
        career_stats={"total_sales_volume": "$164M", "homes_sold": 121, "years_experience": 8,
                      "avg_days_on_market": 31},
        bio_en=(
            "Camila represents families moving into and out of the Valley's gated communities. "
            "She works in English and Spanish and has closed more than a hundred transactions "
            "without a single listing expiring unsold."
        ),
        bio_es=(
            "Camila representa a familias que entran y salen de las comunidades privadas del "
            "Valle. Trabaja en inglés y español y ha cerrado más de cien transacciones sin que "
            "una sola propiedad haya expirado sin venderse."
        ),
        order=3,
    ),
]

COMMUNITIES = [
    dict(
        name="Beverly Hills", slug="beverly-hills", hero_image="",
        latitude=34.0736, longitude=-118.4004, is_featured=True, order=1,
        tagline_en="Flat streets, deep lots, and the most durable address in California.",
        tagline_es="Calles llanas, lotes profundos y la dirección más duradera de California.",
        description_en=(
            "The flats south of Sunset trade on lot width and street canopy; north of Sunset the "
            "market is driven by architecture and privacy. Inventory is thin in both, and the "
            "gap between a renovated house and a project has widened every quarter for two years.\n\n"
            "Buyers here are usually trading up from the Westside or relocating from out of state, "
            "and they underwrite on land value first, improvements second."
        ),
        description_es=(
            "Los terrenos al sur de Sunset se valoran por el ancho del lote; al norte de Sunset el "
            "mercado lo impulsan la arquitectura y la privacidad. El inventario es escaso en ambos."
        ),
        market_data={"median_price": 4250000, "active_listings": 128, "median_dom": 41,
                     "price_per_sqft": 1210, "yoy_change": 2.4},
        lifestyle_info=[
            {"category": "Dining", "items": ["Canon Drive restaurant row", "Two-Michelin-star tasting rooms",
                                             "Sunset-adjacent hotel bars"]},
            {"category": "Shopping", "items": ["Rodeo Drive", "Beverly Drive boutiques", "Century City"]},
            {"category": "Schools", "items": ["Beverly Hills USD", "Independent K-12 within 3 miles"]},
            {"category": "Parks & Recreation", "items": ["Coldwater Canyon Park", "Franklin Canyon trails",
                                                         "Roxbury Park"]},
        ],
    ),
    dict(
        name="Malibu", slug="malibu", hero_image="",
        latitude=34.0259, longitude=-118.7798, is_featured=True, order=2,
        tagline_en="Twenty-one miles of coastline, and no two blocks priced alike.",
        tagline_es="Treinta y cuatro kilómetros de costa, y ni dos manzanas con el mismo precio.",
        description_en=(
            "Malibu is not one market but a dozen: beachfront, bluff, canyon and ranch each move on "
            "their own cycle. Sand-level frontage clears fastest; canyon inventory sits longest.\n\n"
            "Coastal permitting and fire-hardening requirements now shape value as much as square "
            "footage does — a buildable, permitted lot commands a premium that did not exist a decade ago."
        ),
        description_es=(
            "Malibú no es un mercado sino doce: playa, acantilado, cañón y rancho, cada uno con su "
            "propio ciclo. El frente de playa se vende más rápido; el inventario del cañón tarda más."
        ),
        market_data={"median_price": 5100000, "active_listings": 96, "median_dom": 58,
                     "price_per_sqft": 1480, "yoy_change": 1.2},
        lifestyle_info=[
            {"category": "Beaches", "items": ["Point Dume", "Zuma", "Carbon Beach", "El Matador"]},
            {"category": "Dining", "items": ["Cross Creek", "PCH seafood houses", "Trancas Country Market"]},
            {"category": "Schools", "items": ["Santa Monica–Malibu USD", "Independent day schools"]},
            {"category": "Outdoors", "items": ["Solstice Canyon", "Escondido Falls", "Malibu Creek State Park"]},
        ],
    ),
    dict(
        name="Santa Monica", slug="santa-monica", hero_image="",
        latitude=34.0195, longitude=-118.4912, is_featured=True, order=3,
        tagline_en="Walkable, ocean-cooled, and the tightest supply on the Westside.",
        tagline_es="Caminable, refrescada por el océano y con la oferta más escasa del Westside.",
        description_en=(
            "North of Montana holds value through every cycle; Ocean Park and Sunset Park carry the "
            "volume. What Santa Monica sells is a fifteen-minute city — buyers give up lot size for "
            "the ability to walk to work, school and the water.\n\n"
            "Condominium supply is genuinely constrained, and well-run buildings near Palisades Park "
            "rarely stay listed a full month."
        ),
        description_es=(
            "Al norte de Montana el valor se mantiene en cada ciclo; Ocean Park y Sunset Park aportan "
            "el volumen. Santa Mónica vende una ciudad de quince minutos."
        ),
        market_data={"median_price": 2980000, "active_listings": 154, "median_dom": 29,
                     "price_per_sqft": 1105, "yoy_change": 3.1},
        lifestyle_info=[
            {"category": "Dining", "items": ["Main Street", "Montana Avenue", "Downtown SM"]},
            {"category": "Shopping", "items": ["Third Street Promenade", "Montana Avenue boutiques"]},
            {"category": "Schools", "items": ["Santa Monica–Malibu USD", "Crossroads", "Lighthouse"]},
            {"category": "Outdoors", "items": ["Palisades Park", "The Strand", "Annenberg Community Beach House"]},
        ],
    ),
]

LISTINGS = [
    dict(
        slug="beverly-hills-1428-blue-jay-way", asset="beverly-hills-1428-blue-jay-way",
        title="A canyon-edge modern above the Sunset Strip",
        address="1428 Blue Jay Way", city="Beverly Hills", zip_code="90210",
        neighborhood="Bird Streets", latitude=34.0996, longitude=-118.3843,
        price=4250000, status="new", property_type="single_family", bedrooms=5, bathrooms=6,
        square_footage=6200, lot_size=14500, year_built=2019, is_featured=True,
        agent="elena-marchetti", community="beverly-hills",
        highlights=["Canyon-to-ocean views", "Disappearing walls of glass", "Two-story entry gallery",
                    "Rooftop terrace with fire pit"],
        features=["Infinity Pool", "4-Car Garage", "Wine Room", "Home Theater", "Smart Home",
                  "Chef's Kitchen", "Primary Suite Terrace", "Gated Motor Court"],
        description_en=(
            "Set on a promontory at the top of the Bird Streets, this 2019 residence is organised "
            "around a single uninterrupted view corridor that runs from the canyon wall to the "
            "Pacific.\n\n"
            "The main level opens completely: forty feet of glass retract into the walls so the "
            "living room, the terrace and the pool deck read as one room. Below, four bedroom suites "
            "share a gallery-lit hall; above, the primary occupies its own floor with a private "
            "terrace, dual dressing rooms and a stone bath that faces due west.\n\n"
            "Offered with a full 360° tour of the principal rooms."
        ),
        description_es=(
            "Situada en un promontorio en lo alto de las Bird Streets, esta residencia de 2019 se "
            "organiza en torno a un único corredor de vistas que va desde la pared del cañón hasta "
            "el Pacífico.\n\n"
            "El nivel principal se abre por completo: doce metros de cristal se retraen en los muros."
        ),
        images=[("Front elevation at golden hour", "Exterior"),
                ("Living room with retractable glass wall", "Living Room"),
                ("Chef's kitchen with walnut island", "Kitchen"),
                ("Primary suite facing the canyon", "Primary Suite"),
                ("Infinity pool and terrace", "Pool")],
    ),
    dict(
        slug="malibu-210-ocean-front-walk", asset="malibu-210-ocean-front-walk",
        title="Sand-level contemporary on a rare wide frontage",
        address="210 Ocean Front Walk", city="Malibu", zip_code="90265",
        neighborhood="Point Dume", latitude=34.0106, longitude=-118.8065,
        price=6900000, status="coming_soon", property_type="single_family", bedrooms=4, bathrooms=4.5,
        square_footage=4800, lot_size=9800, year_built=2016, is_featured=True,
        agent="david-okonkwo", community="malibu",
        highlights=["58 feet of sand frontage", "Whitewater views from three levels",
                    "Permitted seawall", "Detached guest studio"],
        features=["Beach Access", "Outdoor Shower", "2-Car Garage", "Solar", "Guest House",
                  "Fire Pit", "Heated Floors"],
        description_en=(
            "Fifty-eight feet of frontage on one of the wider sand parcels at Point Dume, with a "
            "permitted seawall already in place — the detail that decides value on this stretch.\n\n"
            "The house is planned in three levels that step back from the water: a glass-walled "
            "living floor at sand level, bedrooms above, and a roof deck that clears the neighbouring "
            "rooflines. A detached studio at the motor court serves as a guest suite or office.\n\n"
            "Coming to market shortly. Private previews are available to qualified buyers."
        ),
        description_es=(
            "Casi dieciocho metros de frente en una de las parcelas más anchas de Point Dume, con "
            "malecón ya permitido — el detalle que decide el valor en este tramo de costa."
        ),
        images=[("Ocean elevation", "Exterior"),
                ("Sand-level living floor", "Living Room"),
                ("Open kitchen and dining", "Kitchen"),
                ("Primary suite above the water", "Primary Suite"),
                ("Terrace and spa", "Terrace")],
    ),
    dict(
        slug="los-angeles-742-hillcrest-avenue", asset="los-angeles-742-hillcrest-avenue",
        title="A restored 1948 post-and-beam with a new kitchen",
        address="742 Hillcrest Avenue", city="Los Angeles", zip_code="90049",
        neighborhood="Brentwood Glen", latitude=34.0561, longitude=-118.4712,
        price=1895000, status="open_house", property_type="single_family", bedrooms=4, bathrooms=3.5,
        square_footage=2840, lot_size=7200, year_built=1948, is_featured=True,
        agent="camila-reyes", community=None,
        open_house_days=6,
        highlights=["Original post-and-beam structure", "New kitchen and baths", "North-facing garden",
                    "Detached studio"],
        features=["Fireplace", "2-Car Garage", "Central AC", "Studio", "Mature Landscaping"],
        description_en=(
            "A 1948 post-and-beam that has been brought forward carefully: the original structure, "
            "clerestory glazing and brick hearth are intact, while the kitchen, baths, systems and "
            "roof are all new within the last two years.\n\n"
            "The plan is a genuine four-bedroom, with a north-facing garden that stays usable through "
            "August and a detached studio at the rear currently used as an office.\n\n"
            "Open house Saturday and Sunday, 1–4pm."
        ),
        description_es=(
            "Una casa post-and-beam de 1948 restaurada con cuidado: la estructura original, los "
            "ventanales altos y la chimenea de ladrillo intactos; cocina, baños e instalaciones nuevos."
        ),
        images=[("Street elevation", "Exterior"),
                ("Living room with original beams", "Living Room"),
                ("New kitchen", "Kitchen"),
                ("Primary bedroom", "Primary Suite"),
                ("Rear garden", "Garden")],
    ),
    dict(
        slug="santa-monica-88-pacific-terrace", asset="santa-monica-88-pacific-terrace",
        title="Ocean-view townhome three blocks from the bluff",
        address="88 Pacific Terrace", city="Santa Monica", zip_code="90402",
        neighborhood="North of Montana", latitude=34.0330, longitude=-118.5063,
        price=3150000, status="price_reduced", property_type="townhome", bedrooms=3, bathrooms=3,
        square_footage=2950, lot_size=3400, year_built=2008, hoa_fee=680, is_featured=True,
        agent="david-okonkwo", community="santa-monica",
        highlights=["Ocean views from two floors", "Private roof deck", "Three blocks to Palisades Park",
                    "Recently reduced"],
        features=["Roof Deck", "2-Car Garage", "Elevator", "Fireplace", "In-Unit Laundry"],
        description_en=(
            "A front-facing townhome on a quiet terrace three blocks from the bluff, with ocean views "
            "from the living floor and the roof deck.\n\n"
            "Three bedrooms, an elevator to all levels, and a two-car garage — the combination that "
            "keeps this pocket of Santa Monica liquid even in slower quarters. Recently repriced to "
            "meet the market.\n\n"
            "HOA covers exterior, roof and common insurance."
        ),
        description_es=(
            "Una casa adosada frontal en una terraza tranquila a tres cuadras del acantilado, con "
            "vistas al mar desde la planta principal y la azotea."
        ),
        images=[("Front elevation", "Exterior"),
                ("Living floor with ocean view", "Living Room"),
                ("Kitchen and dining", "Kitchen"),
                ("Primary bedroom", "Primary Suite"),
                ("Roof deck", "Roof Deck")],
    ),
    dict(
        slug="calabasas-15-rolling-hills-drive", asset="calabasas-15-rolling-hills-drive",
        title="Gated family estate on just under an acre",
        address="15 Rolling Hills Drive", city="Calabasas", zip_code="91302",
        neighborhood="The Oaks", latitude=34.1367, longitude=-118.6614,
        price=2475000, status="pending", property_type="estate", bedrooms=5, bathrooms=4,
        square_footage=4100, lot_size=41000, year_built=2004, hoa_fee=420, is_featured=False,
        agent="camila-reyes", community=None,
        highlights=["0.94-acre flat lot", "24-hour guarded gate", "Sport court and pool",
                    "Five bedrooms including a main-floor suite"],
        features=["Pool", "Spa", "Sport Court", "3-Car Garage", "Guard Gate", "Solar", "Outdoor Kitchen"],
        description_en=(
            "Just under an acre behind a guarded gate, with the flat usable yard that is genuinely "
            "scarce in the Santa Monica Mountains foothills.\n\n"
            "Five bedrooms including a main-floor suite, a pool and spa, a sport court, and an outdoor "
            "kitchen under a covered loggia. The house was built in 2004 and re-roofed and re-piped in "
            "2021.\n\n"
            "Currently in escrow; back-up offers are being accepted."
        ),
        description_es=(
            "Poco menos de media hectárea tras una puerta con vigilancia, con el patio plano y "
            "utilizable que escasea en las estribaciones de las Santa Monica Mountains."
        ),
        images=[("Front elevation and motor court", "Exterior"),
                ("Family room", "Living Room"),
                ("Kitchen with island seating", "Kitchen"),
                ("Primary suite", "Primary Suite"),
                ("Pool, spa and loggia", "Pool")],
    ),
]

# 360° tour for listing #1 only (spec §14). Yaw is degrees clockwise from north.
TOUR = [
    dict(scene_id="living-room", room_name="Living Room", file="living-room.jpg",
         initial_yaw=0, initial_pitch=-4, order=1,
         hotspots=[{"yaw": 152, "pitch": -6, "target": "kitchen", "text": "Kitchen"},
                   {"yaw": -118, "pitch": -6, "target": "primary-suite", "text": "Primary Suite"},
                   {"yaw": 8, "pitch": -10, "target": "terrace", "text": "Pool Terrace"}]),
    dict(scene_id="kitchen", room_name="Kitchen", file="kitchen.jpg",
         initial_yaw=170, initial_pitch=-6, order=2,
         hotspots=[{"yaw": -14, "pitch": -8, "target": "living-room", "text": "Living Room"},
                   {"yaw": 96, "pitch": -8, "target": "primary-suite", "text": "Primary Suite"}]),
    dict(scene_id="primary-suite", room_name="Primary Suite", file="primary-suite.jpg",
         initial_yaw=175, initial_pitch=-5, order=3,
         hotspots=[{"yaw": -20, "pitch": -8, "target": "living-room", "text": "Living Room"},
                   {"yaw": 88, "pitch": -8, "target": "terrace", "text": "Pool Terrace"}]),
    dict(scene_id="terrace", room_name="Pool Terrace", file="terrace.jpg",
         initial_yaw=0, initial_pitch=-8, order=4,
         hotspots=[{"yaw": 6, "pitch": -4, "target": "living-room", "text": "Back Inside"}]),
]

ARTICLES = [
    dict(slug="california-luxury-market-q3", category="market_report",
         cover_image="", author="elena-marchetti", read_minutes=6,
         days_ago=4,
         title_en="Where the California luxury market actually stands",
         title_es="Dónde está realmente el mercado de lujo de California",
         excerpt_en="Median prices held, but the spread between renovated and unrenovated product "
                    "widened again. What that means if you are selling this quarter.",
         excerpt_es="Los precios medianos se mantuvieron, pero la diferencia entre producto "
                    "renovado y sin renovar volvió a ampliarse.",
         body_en=(
             "Headline medians are the least useful number in a luxury market, because they average "
             "two things that are moving in opposite directions.\n\n"
             "Renovated, permitted, move-in product is still clearing close to ask and inside forty "
             "days. Unrenovated inventory at the same address band is taking twice as long and "
             "closing five to nine percent under list. The median hides both.\n\n"
             "For sellers the implication is unglamorous: the pre-market preparation budget is now "
             "the single highest-return decision in the transaction. For buyers, the opposite — the "
             "discount for taking on a project has not been this wide since 2019.\n\n"
             "We publish this report quarterly, drawn from closed transactions rather than list prices."
         ),
         body_es=(
             "Las medianas de titular son el número menos útil en un mercado de lujo, porque promedian "
             "dos cosas que se mueven en direcciones opuestas.\n\n"
             "El producto renovado y listo para habitar sigue cerrando cerca del precio de lista y en "
             "menos de cuarenta días. El inventario sin renovar tarda el doble."
         )),
    dict(slug="beverly-hills-neighborhood-guide", category="neighborhood_guide",
         cover_image="", author="elena-marchetti",
         read_minutes=8, days_ago=18,
         title_en="Beverly Hills, street by street",
         title_es="Beverly Hills, calle por calle",
         excerpt_en="The flats, the post-office district, and north of Sunset are three separate "
                    "markets. A practical guide to which one you are actually buying into.",
         excerpt_es="Los flats, el distrito de la oficina de correos y el norte de Sunset son tres "
                    "mercados distintos.",
         body_en=(
             "People say Beverly Hills as though it were one market. It is at least three, and they "
             "price differently enough that confusing them will cost you.\n\n"
             "**The flats.** South of Sunset, north of Wilshire. Value tracks lot width and street "
             "canopy more than it tracks the house. A fifty-foot lot and a seventy-foot lot on the "
             "same block are not the same asset.\n\n"
             "**North of Sunset.** Hillside, winding, private. Architecture and view carry the price "
             "here, and a difficult driveway can take ten percent off an otherwise strong house.\n\n"
             "**Trousdale.** Flat pads, low rooflines, protected views by covenant. It behaves like "
             "its own micro-market and often leads the others by a quarter."
         ),
         body_es=(
             "La gente dice Beverly Hills como si fuera un solo mercado. Son al menos tres, y sus "
             "precios se comportan de forma lo bastante distinta como para que confundirlos salga caro."
         )),
    dict(slug="what-to-do-before-you-tour", category="buying_guide",
         cover_image="", author="david-okonkwo", read_minutes=5,
         days_ago=32,
         title_en="Six things to settle before you tour a single house",
         title_es="Seis cosas que resolver antes de ver una sola casa",
         excerpt_en="Financing, title, insurance and inspection access decide more deals at this "
                    "price point than the houses themselves do.",
         excerpt_es="El financiamiento, el título, el seguro y el acceso a inspecciones deciden más "
                    "operaciones que las casas mismas.",
         body_en=(
             "At this price point, the buyers who win are not the ones who move fastest on emotion. "
             "They are the ones who have already removed every reason a seller might say no.\n\n"
             "Settle your financing structure in writing. Confirm insurability early — in fire zones "
             "this now takes weeks, not days. Read the preliminary title report before you tour, not "
             "after you are in contract. Know your inspection window and who you will actually call. "
             "Decide your walk-away number and write it down. And agree, in advance, who in your "
             "household has the final vote.\n\n"
             "None of this is glamorous. All of it is why one offer gets accepted over a higher one."
         ),
         body_es=(
             "En este rango de precio, los compradores que ganan no son los que se mueven más rápido "
             "por emoción, sino los que ya eliminaron cada razón por la que un vendedor podría decir no."
         )),
    dict(slug="preparing-a-luxury-home-for-market", category="selling_guide",
         cover_image="", author="camila-reyes", read_minutes=7,
         days_ago=47,
         title_en="What actually returns money when preparing a home for market",
         title_es="Qué devuelve dinero de verdad al preparar una casa para el mercado",
         excerpt_en="Not the kitchen remodel. A ranked list of pre-market spending by measured "
                    "return, drawn from our own closings.",
         excerpt_es="No la remodelación de la cocina. Una lista de gastos previos al mercado, "
                    "ordenada por retorno medido.",
         body_en=(
             "Sellers reliably want to spend money in the wrong order. Here is ours, ranked by what "
             "we can actually measure across recent closings.\n\n"
             "First: paint, light and landscape. Cheap, fast, and it changes the photography, which "
             "changes the click-through, which changes the showing count.\n\n"
             "Second: whatever an inspector will flag. Roof, drainage, panel, sewer line. You will pay "
             "for these either way — paying before the offer costs less than paying during the "
             "renegotiation.\n\n"
             "Third: staging the four rooms buyers photograph.\n\n"
             "A full kitchen remodel three weeks before listing is, in our experience, the least "
             "efficient money a seller can spend."
         ),
         body_es=(
             "Los vendedores suelen querer gastar en el orden equivocado. Este es el nuestro, "
             "ordenado por lo que podemos medir en cierres recientes."
         )),
]


class Command(BaseCommand):
    help = "Load the fictional Sol & Stone demo dataset (spec §14)."

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true",
                            help="Delete existing demo records first")

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts["flush"]:
            Property.objects.all().delete()
            Agent.objects.all().delete()
            Community.objects.all().delete()
            Article.objects.all().delete()
            self.stdout.write("flushed existing records")

        agents = {}
        for data in AGENTS:
            obj, _ = Agent.objects.update_or_create(slug=data["slug"], defaults=data)
            agents[obj.slug] = obj

        communities = {}
        for data in COMMUNITIES:
            obj, _ = Community.objects.update_or_create(slug=data["slug"], defaults=data)
            communities[obj.slug] = obj

        for i, data in enumerate(LISTINGS):
            data = dict(data)
            data.pop("asset")
            images = data.pop("images")
            data.pop("open_house_days", None)
            data["agent"] = agents.get(data.pop("agent"))
            data["community"] = communities.get(data.pop("community"))
            if data["status"] == "open_house":
                data["open_house_at"] = NOW + timedelta(days=3)
            prop, _ = Property.objects.update_or_create(slug=data["slug"], defaults=data)

            prop.images.all().delete()
            for order, (caption, room) in enumerate(images):
                PropertyImage.objects.create(
                    property=prop, image_url=image_url_for(room, i), caption=caption, room=room, order=order,
                )

            if i == 0:
                prop.tour_scenes.all().delete()
                for scene in TOUR:
                    scene = dict(scene)
                    scene.pop("file")
                    # Panorama left blank: TourViewer generates a placeholder
                    # equirectangular image so the tour is walkable in the demo.
                    PropertyTour.objects.create(property=prop, panorama_url="", **scene)

        for data in ARTICLES:
            data = dict(data)
            data["author"] = agents.get(data.pop("author"))
            data["published_at"] = NOW - timedelta(days=data.pop("days_ago"))
            Article.objects.update_or_create(slug=data["slug"], defaults=data)

        self.stdout.write(self.style.SUCCESS(
            f"seeded {Property.objects.count()} listings, {Agent.objects.count()} agents, "
            f"{Community.objects.count()} communities, {Article.objects.count()} articles, "
            f"{PropertyTour.objects.count()} tour scenes"
        ))
