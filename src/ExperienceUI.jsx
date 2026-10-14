import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Clock,
  Check,
  Plus,
  X,
  Play,
  Pause,
  Leaf,
  CalendarDays,
  ShoppingBag,
  Ticket,
  Search,
  Compass,
} from "lucide-react";
import {
  images,
  worlds,
  experiences,
  stadiumExperiences,
  animals,
} from "./worlds";
const Journey = createContext(null);
const safeRead = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};
export function JourneyProvider({ children }) {
  const [saved, setSaved] = useState(() => safeRead("qpass-saved", []));
  const [recent, setRecent] = useState(() => safeRead("qpass-recent", []));
  const [interest, setInterest] = useState(
    () => localStorage.getItem("qpass-interest") || "wildlife",
  );
  useEffect(
    () => localStorage.setItem("qpass-saved", JSON.stringify(saved)),
    [saved],
  );
  useEffect(
    () => localStorage.setItem("qpass-recent", JSON.stringify(recent)),
    [recent],
  );
  useEffect(() => localStorage.setItem("qpass-interest", interest), [interest]);
  const toggle = (id) =>
    setSaved((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const viewed = (id) =>
    setRecent((a) => [id, ...a.filter((x) => x !== id)].slice(0, 8));
  return (
    <Journey.Provider
      value={{ saved, recent, interest, setInterest, toggle, viewed }}
    >
      {children}
    </Journey.Provider>
  );
}
export function Photo({
  src,
  alt = "",
  className = "",
  eager = false,
  ...rest
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const responsive = src?.startsWith("https://images.unsplash.com/")
    ? {
        srcSet: [480, 800, 1400, 2000]
          .map((w) => `${src.replace(/w=\d+/, `w=${w}`)} ${w}w`)
          .join(", "),
        sizes: eager
          ? "100vw"
          : "(max-width: 760px) 85vw, (max-width: 1100px) 45vw, 33vw",
      }
    : {};
  return failed ? (
    <div role="img" aria-label={alt} className={"photo-fallback " + className}>
      <span>QPASS / {alt || "A moment worth discovering"}</span>
    </div>
  ) : (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
      {...responsive}
      {...rest}
    />
  );
}
export function Modal({ title, onClose, children, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll(
          'button,a[href],input,video,[tabindex="0"]',
        );
        const first = nodes?.[0],
          last = nodes?.[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className={"modal-backdrop " + className}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        className="modal-panel"
      >
        <button
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {children}
      </section>
    </div>
  );
}
export function FilmButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="film-button" onClick={() => setOpen(true)}>
        <span>
          <Play size={13} fill="currentColor" />
        </span>{" "}
        A moment of nature <small>00:05</small>
      </button>
      {open && (
        <Modal
          title="A moment of nature"
          onClose={() => setOpen(false)}
          className="film-modal"
        >
          <video
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={images.forest}
            aria-label="Close-up nature film of flowers in a breeze"
          >
            <source src="/media/nature.mp4" type="video/mp4" />
            Your browser does not support this film.
          </video>
          <div className="film-caption">
            <span>A moment of nature.</span>
            <p>
              CC0 botanical film · An atmospheric study, not destination
              footage.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Favorite({ id }) {
  const { saved, toggle } = useContext(Journey);
  const active = saved.includes(id);
  return (
    <button
      className={"favorite " + (active ? "is-saved" : "")}
      aria-label={`${active ? "Unsave" : "Save"} ${[...experiences, ...stadiumExperiences].find((e) => e.id === id)?.name || id}`}
      aria-pressed={active}
      onClick={() => toggle(id)}
    >
      <Heart size={17} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
export function ExperienceCard({ item, number }) {
  const stadium = item.world === "stadium";
  return (
    <article className={"experience-card " + (stadium ? "sports-card" : "")}>
      <div className="experience-photo">
        <a
          href={"#experience/" + (stadium ? "stadium/" : "") + item.id}
          aria-label={"Explore " + item.name}
        >
          <Photo src={item.image} alt={item.name} />
        </a>
        <Favorite id={item.id} />
        <span className="experience-chip">
          {stadium ? "THE STADIUM COLLECTION" : item.label}
        </span>
      </div>
      <div className="experience-meta">
        <span>{stadium ? item.category : "GIZA ZOO"}</span>
        <span>
          <Clock size={12} />
          {item.duration}
        </span>
      </div>
      <a href={"#experience/" + (stadium ? "stadium/" : "") + item.id}>
        <h3>
          {item.name}
          <ArrowUpRight size={19} />
        </h3>
      </a>
      <p>
        {stadium
          ? "Concept experience · Coming soon"
          : `From EGP ${item.price.toLocaleString("en-EG")} / ${item.id === "hotel" ? "night" : "person"}`}
      </p>
    </article>
  );
}
function Rail({ title, eyebrow, items, id, subtitle }) {
  const ref = useRef(null);
  return (
    <section className="editorial-section reveal" id={id}>
      <div className="editorial-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="rail-controls">
          <button
            aria-label={`Previous ${title}`}
            onClick={() =>
              ref.current?.scrollBy({ left: -360, behavior: "smooth" })
            }
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label={`Next ${title}`}
            onClick={() =>
              ref.current?.scrollBy({ left: 360, behavior: "smooth" })
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="experience-rail" ref={ref}>
        {items.map((item) => (
          <ExperienceCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
export function Discovery() {
  const [slide, setSlide] = useState(0);
  const { saved, recent, interest, setInterest } = useContext(Journey);
  const world = worlds[slide];
  const recommended =
    interest === "slow"
      ? [experiences[2], experiences[3], experiences[4]]
      : interest === "family"
        ? [experiences[0], experiences[2], experiences[4]]
        : [experiences[0], experiences[1], experiences[2]];
  const collection = [
    ...experiences,
    ...stadiumExperiences.map((e) => ({ ...e, world: "stadium" })),
  ];
  return (
    <main className="discovery">
      <section className={"cinema-hero world-" + world.id} key={world.id}>
        <Photo
          className="cinema-image"
          src={world.image}
          alt={
            world.name === "Giza Zoo"
              ? "Lion in the afternoon light"
              : world.name
          }
          eager
        />
        <div className="cinema-scrim" />
        <div className="hero-edition">
          <span>CURATED DAYS. EXTRAORDINARY PLACES.</span>
          <span>EGYPT, THROUGH A DIFFERENT LENS</span>
        </div>
        <div className="cinema-copy">
          <div className="eyebrow light">
            <span />
            THE QPASS COLLECTION / {world.number}
          </div>
          <h1>
            {slide === 0 ? (
              <>
                Life is better
                <br />
                <em>out there.</em>
              </>
            ) : slide === 1 ? (
              <>
                This is where
                <br />
                <em>you belong.</em>
              </>
            ) : slide === 2 ? (
              <>
                Feel absolutely
                <br />
                <em>everything.</em>
              </>
            ) : (
              <>
                Rise above
                <br />
                <em>the everyday.</em>
              </>
            )}
          </h1>
          <p>
            {slide === 0
              ? "Wild encounters. Electric nights. A whole new perspective. Some days deserve more than the ordinary."
              : world.desc}
          </p>
          <div className="hero-buttons">
            <a className="button cream" href={"#" + world.route}>
              Explore {world.name}
              <ArrowUpRight size={17} />
            </a>
            {slide === 0 && <FilmButton />}
          </div>
        </div>
        <div className="hero-bottom">
          <div>
            <MapPin size={14} />
            <span>
              {world.name}
              <small>{world.location}</small>
            </span>
          </div>
          <span className="hero-scroll">
            SCROLL TO DISCOVER <span>↓</span>
          </span>
          <div className="hero-pagination">
            {worlds.map((w, i) => (
              <button
                key={w.id}
                aria-label={`Show ${w.name}`}
                aria-pressed={slide === i}
                className={slide === i ? "chosen" : ""}
                onClick={() => setSlide(i)}
              >
                0{i + 1}
                <i />
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="discovery-ribbon">
        <span>ONE PASS. FOUR WORLDS.</span>
        <p>Go for the experience. Stay for the feeling.</p>
        <a href="#plan">
          Make a day of it <ArrowUpRight size={16} />
        </a>
      </div>
      <section
        className="editorial-section worlds-section reveal"
        id="destinations"
      >
        <div className="editorial-heading">
          <div>
            <div className="eyebrow">CHOOSE YOUR WORLD</div>
            <h2>
              Where will the day
              <br />
              <em>take you?</em>
            </h2>
          </div>
          <p>
            For the wildly curious. The lifelong fans.
            <br />
            The night people. The early risers.
            <br />
            <strong>There’s a world here with your name on it.</strong>
          </p>
        </div>
        <div className="world-grid">
          {worlds.map((w) => (
            <a
              className={"world-card world-" + w.id}
              href={"#" + w.route}
              key={w.id}
            >
              <Photo src={w.image} alt={w.name} />
              <div className="world-card-shade" />
              <div className="world-card-top">
                <span>
                  {w.number} / {w.type}
                </span>
                <span className="world-status">
                  {w.id === "zoo"
                    ? "EXPLORE & BOOK"
                    : w.id === "stadium"
                      ? "THE CONCEPT"
                      : "COMING SOON"}
                </span>
              </div>
              <div className="world-card-copy">
                <span>{w.label}</span>
                <h3>
                  {w.name === "Vodafone Stadium" ? (
                    <>
                      Vodafone
                      <br />
                      Stadium
                    </>
                  ) : w.name === "Hot Air Balloons" ? (
                    <>
                      Above
                      <br />
                      the ordinary.
                    </>
                  ) : w.name === "Concerts" ? (
                    <>
                      After
                      <br />
                      dark.
                    </>
                  ) : (
                    "Giza Zoo"
                  )}
                </h3>
                <p>{w.desc}</p>
                <div>
                  <span>
                    <MapPin size={12} />
                    {w.location}
                  </span>
                  <i>
                    <ArrowUpRight size={21} />
                  </i>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
      <section className="interest-bar editorial-section">
        <div>
          <span className="eyebrow">A LITTLE MORE YOU</span>
          <h3>What kind of day are you feeling?</h3>
        </div>
        <div className="interest-options">
          {[
            ["wildlife", "Into the wild"],
            ["family", "Family time"],
            ["slow", "The slow life"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={interest === id}
              className={interest === id ? "selected" : ""}
              onClick={() => setInterest(id)}
            >
              {label}
              {interest === id && <Check size={13} />}
            </button>
          ))}
        </div>
      </section>
      <Rail
        title="Go on. Get a little closer."
        eyebrow={
          "PICKED FOR YOUR " +
          (interest === "family"
            ? "FAMILY DAY"
            : interest === "slow"
              ? "SLOW DAY"
              : "WILD SIDE")
        }
        items={recommended}
        subtitle="A few ways to turn a day out into a story worth telling."
      />
      <section className="story-split reveal">
        <div className="story-visual">
          <Photo
            src={images.giraffe}
            alt="A giraffe looking out across its habitat"
          />
          <span>01 / THE WILD SIDE</span>
        </div>
        <div className="story-copy">
          <div className="eyebrow">GIZA ZOO, REIMAGINED</div>
          <h2>
            Less screen time.
            <br />
            <em>More wide eyes.</em>
          </h2>
          <p>
            A morning of little discoveries. A lunch that lasts a little longer.
            A moment with an animal you’ll talk about all the way home.
          </p>
          <p>
            Build a day around the things you love. We’ll bring it all together
            in one pass.
          </p>
          <a className="button cream" href="#plan">
            Plan your wild day
            <ArrowUpRight size={17} />
          </a>
          <a className="underlined" href="#animals">
            Meet the residents <ArrowRight size={15} />
          </a>
        </div>
      </section>
      <Rail
        title="A different league."
        eyebrow="THE STADIUM EDIT / COMING SOON"
        items={stadiumExperiences
          .slice(0, 5)
          .map((e) => ({ ...e, world: "stadium" }))}
      />
      {saved.length > 0 && (
        <Rail
          title="Your someday collection."
          eyebrow="SAVED FOR YOU / ON THIS DEVICE"
          items={collection.filter((e) => saved.includes(e.id))}
        />
      )}
      {recent.length > 0 && (
        <Rail
          title="Still on your mind?"
          eyebrow="RECENTLY EXPLORED"
          items={recent
            .map((id) => collection.find((e) => e.id === id))
            .filter(Boolean)}
        />
      )}
      <section className="closing-story">
        <span className="eyebrow">MAKE ROOM FOR A GOOD DAY</span>
        <h2>
          The best memories
          <br />
          start with <em>“let’s go.”</em>
        </h2>
        <a href="#plan" className="button cream">
          Find your kind of day
          <ArrowUpRight size={17} />
        </a>
      </section>
    </main>
  );
}
export function ZooHero({ route }) {
  const visual =
    route === "restaurants"
      ? images.dining
      : route === "hotel"
        ? images.hotel
        : route === "experiences"
          ? images.giraffe
          : images.hero;
  return (
    <section className="destination-hero zoo-hero">
      <Photo
        className="destination-hero-image"
        src={visual}
        alt={
          route === "hotel"
            ? "Atmospheric hotel pool"
            : route === "restaurants"
              ? "An intimate restaurant setting"
              : "Wildlife portrait"
        }
        eager
      />
      <div className="cinema-scrim" />
      <div className="destination-hero-copy">
        <a className="back-link" href="#home">
          <ArrowLeft size={14} /> THE QPASS COLLECTION
        </a>
        <div className="eyebrow light">GIZA ZOO / THE WILD WITHIN</div>
        <h1>
          {route === "hotel" ? (
            <>
              Stay a little
              <br />
              <em>longer.</em>
            </>
          ) : route === "restaurants" ? (
            <>
              Take the
              <br />
              <em>delicious route.</em>
            </>
          ) : route === "experiences" ? (
            <>
              A little closer.
              <br />
              <em>A lot more wonder.</em>
            </>
          ) : (
            <>
              A day closer
              <br />
              <em>to nature.</em>
            </>
          )}
        </h1>
        <p>A little wild. A little wonder. A whole day together.</p>
        <div className="destination-facts">
          <span>
            <MapPin size={14} /> Giza, Egypt
          </span>
          <span>
            <Clock size={14} /> 9 am – 5 pm · Demo hours
          </span>
          <span>
            <Leaf size={14} /> Made for discovery
          </span>
        </div>
      </div>
      <span className="photo-caption">
        ATMOSPHERE PHOTOGRAPHY · ILLUSTRATIVE
      </span>
    </section>
  );
}
export function BookingProgress({ route }) {
  const stage =
    route === "pass" || route === "souvenir"
      ? 3
      : route === "checkout"
        ? 2
        : route === "basket"
          ? 1
          : 0;
  return (
    <div className="booking-progress" aria-label="Booking progress">
      {["Discover", "Your day", "Details", "Your pass"].map((label, i) => (
        <React.Fragment key={label}>
          {i > 0 && <i />}
          <a
            href={"#" + ["tickets", "basket", "checkout", "pass"][i]}
            aria-current={stage === i ? "step" : undefined}
            className={stage >= i ? "complete" : ""}
          >
            <span>{stage > i ? <Check size={10} /> : `0${i + 1}`}</span>
            {label}
          </a>
        </React.Fragment>
      ))}
    </div>
  );
}
export function ProductVisual({ product, route }) {
  const item = experiences.find((e) => e.id === product.id);
  return (
    <>
      <Photo
        className="product-thumbnail"
        src={item?.image || images[product.id === "child" ? "giraffe" : "hero"]}
        alt={product.name}
      />
      {item && (
        <a className="product-detail-link" href={"#experience/" + item.id}>
          Explore the experience <ArrowUpRight size={13} />
        </a>
      )}
    </>
  );
}
export function LocationSection({ stadium = false }) {
  return (
    <section className={"location-section " + (stadium ? "location-dark" : "")}>
      <div>
        <div className="eyebrow">A PLACE IN YOUR DAY</div>
        <h2>
          {stadium ? "Find your way to the roar." : "An escape in the city."}
        </h2>
        <p>
          {stadium
            ? "Stadium destination concept, Egypt. Exact location and arrival details will be confirmed before booking opens."
            : "Giza Zoo · Charles de Gaulle Street, Giza, Egypt. Plan your route and leave a little time for a slower arrival."}
        </p>
        {!stadium && (
          <a
            className="underlined"
            href="https://www.openstreetmap.org/search?query=Giza%20Zoo%20Egypt"
            target="_blank"
            rel="noreferrer"
          >
            Open location in maps
            <ArrowUpRight size={15} />
          </a>
        )}
      </div>
      <div
        className="location-map"
        aria-label={
          stadium
            ? "Illustrative stadium location graphic"
            : "Illustrative Giza location graphic, not a navigation map"
        }
      >
        <div className="map-river" />
        <div className="map-road one" />
        <div className="map-road two" />
        <div className="map-road three" />
        <span className="map-label">
          {stadium ? "THE NEXT CHAPTER" : "GIZA"}
        </span>
        <div className="map-marker">
          <MapPin size={20} />
          <strong>{stadium ? "Vodafone Stadium" : "Giza Zoo"}</strong>
        </div>
        <small>ILLUSTRATIVE LOCATION / NOT TO SCALE</small>
      </div>
    </section>
  );
}
export function ExperienceDetail({ id, stadium, onAdd, cart, notify }) {
  const item = (stadium ? stadiumExperiences : experiences).find(
    (e) => e.id === id,
  );
  const { viewed } = useContext(Journey);
  useEffect(() => {
    if (item) viewed(item.id);
  }, [id, stadium]);
  if (!item)
    return (
      <div className="empty-state">
        <h1>A little off the beaten path.</h1>
        <a href="#home" className="button green">
          Back to discovery
        </a>
      </div>
    );
  return (
    <main className={"experience-detail " + (stadium ? "stadium-world" : "")}>
      <section className="detail-hero">
        <Photo src={item.image} alt={item.name} eager />
        <div className="cinema-scrim" />
        <div className="detail-hero-copy">
          <a
            className="back-link"
            href={stadium ? "#stadium" : "#" + item.category}
          >
            <ArrowLeft size={15} />
            {stadium ? "THE STADIUM COLLECTION" : "GIZA ZOO"}
          </a>
          <span className="eyebrow light">
            {stadium ? item.category : item.label}
          </span>
          <h1>
            {item.name}
            <em>.</em>
          </h1>
          <p>{item.desc}</p>
          <div className="detail-facts">
            <span>
              <Clock size={15} />
              {item.duration}
            </span>
            <span>
              <MapPin size={15} />
              {stadium ? "Stadium concept, Egypt" : "Giza Zoo"}
            </span>
            {!stadium && <span>{item.age}</span>}
          </div>
        </div>
        <Favorite id={item.id} />
      </section>
      <div className="detail-content">
        <div>
          <div className="eyebrow">NOT JUST A TICKET. A STORY.</div>
          <h2>{stadium ? "A new way to belong." : "Make room for wonder."}</h2>
          <p>
            {item.desc}{" "}
            {stadium
              ? "This is an independently designed destination concept. Experiences, availability and pricing are not yet confirmed."
              : "A thoughtfully paced experience to make your zoo day feel a little more personal. All availability and activities are illustrative in this prototype."}
          </p>
          <ul className="highlight-list">
            {item.highlights.map((h) => (
              <li key={h}>
                <Check size={17} />
                {h}
              </li>
            ))}
          </ul>
          <div className="detail-note">
            <Leaf size={20} />
            <p>
              {stadium
                ? "Concept preview only. No real access, retail inventory, affiliation, or hospitality availability is represented."
                : "Animal welfare comes first. Encounters are keeper-led concepts and may vary. A zoo entry ticket is required."}
            </p>
          </div>
        </div>
        <aside className="detail-booking">
          <span className="eyebrow">
            {stadium ? "THE NEXT CHAPTER" : "YOUR DAY, YOUR WAY"}
          </span>
          <h3>
            {stadium ? (
              "Worth the wait."
            ) : (
              <>
                EGP {item.price.toLocaleString("en-EG")}
                <small> / {id === "hotel" ? "night" : "person"}</small>
              </>
            )}
          </h3>
          <div className="availability">
            <span />
            {stadium
              ? "Bookings not open"
              : "Demo availability · Select date in basket"}
          </div>
          {!stadium && (
            <>
              <div className="detail-slot">
                <Clock size={15} />
                {item.slot} · Illustrative schedule
              </div>
              <button
                className="button green full"
                onClick={() => {
                  onAdd(id, 1);
                  notify(`${item.name} added to your day`);
                }}
              >
                {cart[id] ? `Add another (${cart[id]})` : "Add to day"}
                <Plus size={16} />
              </button>
              <a href="#basket" className="underlined">
                Review your day
                <ArrowRight size={15} />
              </a>
            </>
          )}
          {stadium && (
            <a className="button cream full" href="#stadium">
              Explore the collection
              <ArrowRight size={17} />
            </a>
          )}
          <small className="prototype-note">
            {stadium
              ? "Concept destination · Coming soon"
              : "Mock booking · No real payment"}
          </small>
        </aside>
      </div>
      <LocationSection stadium={stadium} />
    </main>
  );
}
export function Stadium() {
  const [filter, setFilter] = useState("All experiences");
  const groups = {
    "All experiences": stadiumExperiences,
    Matchday: stadiumExperiences.filter((e) =>
      ["match", "lounge", "suites"].includes(e.id),
    ),
    Explore: stadiumExperiences.filter((e) =>
      ["tour", "museum", "tunnel"].includes(e.id),
    ),
    "Eat, stay & shop": stadiumExperiences.filter((e) =>
      ["stay", "strip", "dining", "store", "bricks"].includes(e.id),
    ),
  };
  return (
    <main className="stadium-world">
      <section className="stadium-hero">
        <Photo
          className="cinema-image"
          src={images.stadium}
          alt="Football stadium under the floodlights"
          eager
        />
        <div className="stadium-scrim" />
        <div className="stadium-topline">
          <a href="#home">
            <ArrowLeft size={14} /> THE QPASS COLLECTION
          </a>
          <span>02 / THE HOME OF BELONGING</span>
        </div>
        <div className="stadium-title">
          <div className="eyebrow">VODAFONE STADIUM / DESTINATION CONCEPT</div>
          <h1>
            Some places
            <br />
            are <em>in your blood.</em>
          </h1>
          <p>
            More than ninety minutes. A world of football,
            <br />
            hospitality, heritage and belonging.
          </p>
          <a
            className="button sports-button"
            href="#stadium"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("stadium-collection")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Step inside
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="stadium-marquee">
          THE ROAR. THE RED. THE REST IS HISTORY.
        </div>
      </section>
      <div className="stadium-intro">
        <span>
          ONE DESTINATION.
          <br />
          EVERY SIDE OF THE GAME.
        </span>
        <p>
          Walk the tunnel. Discover the legacy. Make matchday your own. This is
          a first look at a destination made for the people who live it.
        </p>
        <small>
          Independent prototype · Not an official club or venue website.
          <br />
          All experiences shown are concepts and are not bookable.
        </small>
      </div>
      <section className="editorial-section" id="stadium-collection">
        <div className="editorial-heading">
          <div>
            <div className="eyebrow">THE STADIUM COLLECTION</div>
            <h2>
              Make it more
              <br />
              than <em>matchday.</em>
            </h2>
          </div>
          <span className="collection-count">11 WAYS TO BELONG</span>
        </div>
        <div className="stadium-filters">
          {Object.keys(groups).map((label) => (
            <button
              key={label}
              aria-pressed={filter === label}
              className={filter === label ? "selected" : ""}
              onClick={() => setFilter(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="stadium-grid">
          {groups[filter].map((item) => (
            <ExperienceCard
              key={item.id}
              item={{ ...item, world: "stadium" }}
            />
          ))}
        </div>
      </section>
      <section className="brick-story">
        <Photo src={images.bricks} alt="Architectural brick texture" />
        <div>
          <div className="eyebrow">EL QALAA EL HAMRAA / THE FAN EDIT</div>
          <h2>
            Not just in the stands.
            <br />
            <em>In the story.</em>
          </h2>
          <p>
            An engraved name. A lifelong connection. Explore a concept
            collection of personalised bricks and fan keepsakes.
          </p>
          <a className="button cream" href="#experience/stadium/bricks">
            Leave your mark
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <LocationSection stadium />
    </main>
  );
}
export function ComingWorld({ id }) {
  const w = worlds.find((w) => w.id === id);
  return (
    <main className={"coming-world world-" + id}>
      <section className="cinema-hero">
        <Photo className="cinema-image" src={w.image} alt={w.name} eager />
        <div className="cinema-scrim" />
        <div className="cinema-copy">
          <a className="back-link" href="#home">
            <ArrowLeft size={15} /> ALL WORLDS
          </a>
          <div className="eyebrow light">{w.label}</div>
          <h1>
            {id === "concerts" ? (
              <>
                Live for
                <br />
                <em>the night.</em>
              </>
            ) : (
              <>
                Catch the
                <br />
                <em>first light.</em>
              </>
            )}
          </h1>
          <p>{w.desc}</p>
          <span className="coming-pill">
            THE NEXT QPASS CHAPTER · COMING SOON
          </span>
          <a className="underlined" href="#tickets">
            While you wait, find your wild side
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="coming-location">
          <MapPin size={16} />
          {w.location}
          <small>
            Atmosphere photography · Not a confirmed venue or operator
          </small>
        </div>
      </section>
      <section className="coming-editorial">
        <span>0{id === "concerts" ? 3 : 4} / THE QPASS COLLECTION</span>
        <h2>
          {id === "concerts"
            ? "For the moments you feel in your chest."
            : "A quieter kind of extraordinary."}
        </h2>
        <p>
          {id === "concerts"
            ? "Stage lights. Shared anthems. That one song you’ll never hear the same way again. A new world of music experiences is taking shape."
            : "Warm air. Ancient landscapes. A sunrise that feels like it belongs to you. Our adventure collection is taking shape."}
        </p>
        <a href="#home" className="button outline">
          Explore the collection
          <ArrowUpRight size={17} />
        </a>
      </section>
    </main>
  );
}
export function AnimalDirectory() {
  const [filter, setFilter] = useState("All habitats");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const shown = animals.filter(
    (a) =>
      (filter === "All habitats" || a.group === filter) &&
      a.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main className="animal-page">
      <ZooHero route="experiences" />
      <div className="editorial-section">
        <div className="editorial-heading">
          <div>
            <div className="eyebrow">THE RESIDENTS / EDUCATIONAL DIRECTORY</div>
            <h2>
              Different by nature.
              <br />
              <em>Extraordinary, together.</em>
            </h2>
          </div>
          <p>
            A little knowledge makes every encounter richer.
            <br />
            An illustrative animal collection, not a confirmed zoo inventory.
          </p>
        </div>
        <div className="animal-toolbar">
          <div className="filter-chips">
            {["All habitats", "Savanna", "Forest", "Wetlands"].map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                className={filter === f ? "selected" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="animal-search">
            <Search size={16} />
            <input
              aria-label="Search animals"
              placeholder="Find an animal"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <div className="animal-grid">
          {shown.map((a) => (
            <button
              className="animal-card"
              key={a.id}
              onClick={() => setSelected(a)}
            >
              <Photo src={a.image} alt={a.name} />
              <div>
                <span>{a.group}</span>
                <h3>
                  {a.name}
                  <ArrowUpRight size={20} />
                </h3>
                <p>{a.latin}</p>
              </div>
            </button>
          ))}
        </div>
        {!shown.length && (
          <p className="no-results">
            No animals match that search. Try a different habitat or name.
          </p>
        )}
        <div className="conservation-note">
          <Leaf size={32} />
          <h3>Wonder is the beginning of caring.</h3>
          <p>
            Learn their stories. Respect their space. The smallest moments of
            curiosity can become a lifelong love of the natural world.
          </p>
          <a href="#experiences" className="underlined">
            Explore keeper-led experiences
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
      <LocationSection />
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <Photo
            className="animal-modal-photo"
            src={selected.image}
            alt={selected.name}
          />
          <div className="animal-modal-copy">
            <div className="eyebrow">
              {selected.group} / EDUCATIONAL PROFILE
            </div>
            <h2>{selected.name}</h2>
            <em>{selected.latin}</em>
            <p>{selected.fact}</p>
            <span className="status-label">
              Global species status: {selected.status}
            </span>
            <small>
              General educational information. Sightings and animal availability
              are not guaranteed.
            </small>
            <a
              className="button green"
              href="#experiences"
              onClick={() => setSelected(null)}
            >
              Discover an experience
              <ArrowUpRight size={16} />
            </a>
          </div>
        </Modal>
      )}
    </main>
  );
}
const plans = {
  family: {
    title: "A day for wide eyes.",
    desc: "Little discoveries. Big memories. Plenty of time to pause.",
    ids: ["giraffe", "picnic"],
    slots: ["10:30", "13:00"],
  },
  wildlife: {
    title: "Follow your curiosity.",
    desc: "Look closer. Ask more. Leave with a new perspective.",
    ids: ["giraffe", "keeper", "picnic"],
    slots: ["10:30", "11:30", "13:00"],
  },
  slow: {
    title: "Take the scenic route.",
    desc: "No rush. Good food. A little longer to stay.",
    ids: ["lunch", "hotel"],
    slots: ["13:30", "15:00"],
  },
};
export function DayPlanner({ onAdd, cart, notify }) {
  const { interest, setInterest } = useContext(Journey);
  const [step, setStep] = useState(1);
  const [removed, setRemoved] = useState([]);
  const plan = plans[interest] || plans.wildlife;
  const picks = plan.ids.filter((id) => !removed.includes(id));
  const price =
    150 +
    picks.reduce((s, id) => s + experiences.find((e) => e.id === id).price, 0);
  return (
    <main className="planner-page">
      <div className="planner-photo">
        <Photo
          src={interest === "slow" ? images.hotel : images.giraffe}
          alt="Your next Giza Zoo adventure"
          eager
        />
        <div className="planner-photo-copy">
          <span className="eyebrow light">GIZA ZOO / YOUR DAY, YOUR WAY</span>
          <h2>
            Good days don’t
            <br />
            happen by accident.
            <br />
            <em>Well, not always.</em>
          </h2>
          <p>
            A little inspiration. A few thoughtful choices.
            <br />
            One day that feels like you.
          </p>
        </div>
      </div>
      <div className="planner-content">
        <a href="#home" className="back-link">
          <ArrowLeft size={15} /> BACK TO DISCOVERY
        </a>
        <div className="planner-step">
          0{step} / 02{" "}
          <span>{step === 1 ? "SET THE MOOD" : "MAKE IT YOURS"}</span>
        </div>
        <h1>
          {step === 1 ? (
            <>
              What’s your
              <br />
              <em>kind of day?</em>
            </>
          ) : (
            plan.title
          )}
        </h1>
        <p>
          {step === 1
            ? "Choose a feeling. We’ll take it from there."
            : plan.desc}
        </p>
        {step === 1 ? (
          <>
            <div className="planner-options">
              {[
                [
                  "family",
                  "For the whole crew",
                  "Shared wonder, little explorers, and picnic breaks.",
                ],
                [
                  "wildlife",
                  "A little more wild",
                  "Keeper stories and closer encounters.",
                ],
                [
                  "slow",
                  "The art of slowing down",
                  "A long lunch, garden views, and an overnight escape.",
                ],
              ].map(([id, name, desc]) => (
                <button
                  className={interest === id ? "selected" : ""}
                  aria-pressed={interest === id}
                  key={id}
                  onClick={() => {
                    setInterest(id);
                    setRemoved([]);
                  }}
                >
                  <span>
                    {name}
                    <small>{desc}</small>
                  </span>
                  <span className="choice-circle">
                    {interest === id && <Check size={14} />}
                  </span>
                </button>
              ))}
            </div>
            <button className="button green full" onClick={() => setStep(2)}>
              Build my day
              <ArrowRight size={17} />
            </button>
          </>
        ) : (
          <>
            <div className="itinerary">
              <div className="itinerary-entry">
                <time>09:30</time>
                <div>
                  <span>THE BEGINNING</span>
                  <h3>Arrive & find your wild side</h3>
                  <p>Adult day pass · EGP 150</p>
                </div>
                <Ticket size={18} />
              </div>
              {picks.map((id) => {
                const e = experiences.find((e) => e.id === id);
                return (
                  <div className="itinerary-entry" key={id}>
                    <time>{plan.slots[plan.ids.indexOf(id)]}</time>
                    <div>
                      <span>{e.category.toUpperCase()}</span>
                      <a href={"#experience/" + id}>
                        <h3>{e.name}</h3>
                      </a>
                      <p>
                        {e.duration} · EGP {e.price}
                      </p>
                    </div>
                    <button
                      aria-label={"Remove " + e.name + " from plan"}
                      onClick={() => setRemoved((a) => [...a, id])}
                    >
                      <X size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="planner-total">
              <span>
                Suggested day, from<small>One adult · Demo prices</small>
              </span>
              <strong>EGP {price.toLocaleString("en-EG")}</strong>
            </div>
            <button
              className="button green full"
              onClick={() => {
                ["adult", ...picks].forEach((id) => {
                  if (!cart[id]) onAdd(id, 1);
                });
                notify(
                  "Your day is in the basket. Choose a date and adjust your guests.",
                );
                location.hash = "basket";
              }}
            >
              Make this my day
              <ArrowUpRight size={17} />
            </button>
            <button className="planner-back" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> Change the mood
            </button>
            <p className="planner-disclaimer">
              Suggested itinerary, not a timed reservation. Select your date and
              guest quantities in the basket. Animal encounters are demo
              concepts.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
export function MobileBookingDrawer({ count, total, summary, onBasket }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-booking">
      <div className="mobile-booking-bar">
        <button onClick={() => setOpen(true)} aria-label="Open booking drawer">
          <ShoppingBag size={19} />
          <span>
            Your day{" "}
            <small>
              {count} {count === 1 ? "item" : "items"} · EGP{" "}
              {total.toLocaleString("en-EG")}
            </small>
          </span>
          <ChevronRight size={15} />
        </button>
        <button className="button green" disabled={!count} onClick={onBasket}>
          View basket
          <ArrowUpRight size={15} />
        </button>
      </div>
      {open && (
        <Modal
          title="Your booking drawer"
          onClose={() => setOpen(false)}
          className="drawer-modal"
        >
          <div className="summary drawer-summary">
            {summary}
            <button
              className="button green full"
              disabled={!count}
              onClick={() => {
                setOpen(false);
                onBasket();
              }}
            >
              Continue to basket
              <ArrowRight size={17} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
export function RevealController({ route }) {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("reveal-pending");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [route]);
  return null;
}
