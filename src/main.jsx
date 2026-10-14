import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Ticket,
  ShoppingBag,
  Menu,
  X,
  Plus,
  Minus,
  Check,
  CalendarDays,
  Clock,
  ShieldCheck,
  Leaf,
  Download,
  Sparkles,
  ChevronRight,
  Heart,
  BedDouble,
  Utensils,
  PawPrint,
  Compass,
} from "lucide-react";
import "./style.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import { QRCodeSVG } from "qrcode.react";

const images = Object.fromEntries(
  [
    "hero",
    "zoo",
    "stadium",
    "concert",
    "balloon",
    "giraffe",
    "food",
    "hotel",
  ].map((name) => [name, `/images/${name}.svg`]),
);
const destinations = [
  {
    name: "Giza Zoo",
    tag: "A WILD LITTLE ESCAPE",
    type: "Nature & discovery",
    location: "Giza, Egypt",
    image: images.zoo,
    price: "150",
    live: true,
  },
  {
    name: "Vodafone Stadium",
    tag: "FEEL EVERY MOMENT",
    type: "Sports & live action",
    location: "Cairo, Egypt",
    image: images.stadium,
  },
  {
    name: "Concerts",
    tag: "FIND YOUR RHYTHM",
    type: "Music & unforgettable nights",
    location: "Across Egypt",
    image: images.concert,
  },
  {
    name: "Hot Air Balloons",
    tag: "A DIFFERENT PERSPECTIVE",
    type: "Adventure & open skies",
    location: "Luxor, Egypt",
    image: images.balloon,
  },
];
const products = {
  tickets: [
    {
      id: "adult",
      name: "Adult day pass",
      desc: "A whole day of discovery. Ages 12 and above.",
      price: 150,
    },
    {
      id: "child",
      name: "Little explorer pass",
      desc: "Big adventures for ages 3–11. Under 3s enter free.",
      price: 75,
    },
  ],
  experiences: [
    {
      id: "giraffe",
      name: "Meet the gentle giants",
      desc: "A guided giraffe encounter · 20 minutes · Ages 6+",
      price: 250,
    },
    {
      id: "keeper",
      name: "Behind the wild",
      desc: "Explore with a keeper · 45 minutes · Ages 8+",
      price: 350,
    },
  ],
  restaurants: [
    {
      id: "picnic",
      name: "The garden picnic",
      desc: "Fresh sandwiches, seasonal fruit & juice · Serves one",
      price: 180,
    },
    {
      id: "lunch",
      name: "Wild Fig lunch",
      desc: "A relaxed garden lunch · Main course & soft drink",
      price: 280,
    },
  ],
  hotel: [
    {
      id: "hotel",
      name: "The Garden House",
      desc: "One night · Garden-view double room · Breakfast for two",
      price: 2400,
    },
  ],
};
const tabs = [
  ["tickets", "Tickets", Ticket],
  ["experiences", "Animal experiences", PawPrint],
  ["restaurants", "Restaurants", Utensils],
  ["hotel", "Hotel", BedDouble],
];
const today = () => new Date().toISOString().slice(0, 10);
function readCart() {
  try {
    return JSON.parse(localStorage.getItem("qpass-cart")) || {};
  } catch {
    return {};
  }
}
function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "home");
  const [cart, setCart] = useState(readCart);
  const [date, setDate] = useState(
    localStorage.getItem("qpass-date") || today(),
  );
  const [notice, setNotice] = useState("");
  const [mobile, setMobile] = useState(false);
  const [booking, setBooking] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("qpass-booking"));
    } catch {
      return null;
    }
  });
  const [guest, setGuest] = useState({ name: "", email: "" });
  React.useEffect(() => {
    const f = () => {
      setRoute(location.hash.slice(1) || "home");
      window.scrollTo(0, 0);
      setMobile(false);
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  React.useEffect(() => {
    localStorage.setItem("qpass-cart", JSON.stringify(cart));
  }, [cart]);
  React.useEffect(() => {
    localStorage.setItem("qpass-date", date);
  }, [date]);
  React.useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 3200);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const go = (r) => {
    location.hash = r;
  };
  const all = Object.values(products).flat();
  const items = all.filter((p) => cart[p.id] > 0);
  const count = items.reduce((s, p) => s + cart[p.id], 0);
  const total = items.reduce((s, p) => s + p.price * cart[p.id], 0);
  const update = (id, n) =>
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + n) }));
  const hasTicket = !!(cart.adult || cart.child);
  const money = (n) => n.toLocaleString("en-EG");
  const formatDate = (d) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  function complete(e) {
    e.preventDefault();
    if (!date || date < today()) {
      setNotice("Choose a valid visit date in your basket.");
      go("basket");
      return;
    }
    if (!hasTicket) {
      setNotice("Add a zoo entry ticket to continue.");
      go("tickets");
      return;
    }
    const b = {
      id: "QP-" + Date.now().toString(36).toUpperCase(),
      name: guest.name,
      email: guest.email,
      date,
      total,
      items: items.map((p) => ({ ...p, quantity: cart[p.id] })),
    };
    setBooking(b);
    localStorage.setItem("qpass-booking", JSON.stringify(b));
    setCart({});
    go("pass");
  }
  const summary = (
    <>
      <div className="summary-top">
        <span>Your day, together</span>
        <ShoppingBag size={19} />
      </div>
      <div className="summary-destination">
        <img src={images.zoo} />
        <div>
          <strong>Giza Zoo</strong>
          <small>
            <MapPin size={12} /> Giza, Egypt
          </small>
        </div>
      </div>
      <label className="date-label">
        Your visit date
        <input
          aria-label="Visit date"
          type="date"
          min={today()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      {items.length ? (
        items.map((p) => (
          <div className="summary-item" key={p.id}>
            <div>
              <strong>{p.name}</strong>
              <small>EGP {money(p.price)} each</small>
            </div>
            <div className="quantity">
              <button
                aria-label={`Remove one ${p.name}`}
                onClick={() => update(p.id, -1)}
              >
                <Minus size={12} />
              </button>
              <span>{cart[p.id]}</span>
              <button
                aria-label={`Add one ${p.name}`}
                onClick={() => update(p.id, 1)}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="empty-copy">
          Your next great day starts with a ticket. Add something you’ll love.
        </p>
      )}
      <div className="total">
        <span>
          Total <small>Taxes included</small>
        </span>
        <strong>
          <small>EGP</small> {money(total)}
        </strong>
      </div>
    </>
  );
  return (
    <>
      <header>
        <a className="logo" href="#home">
          Q<span>PASS</span>
          <i />
        </a>
        <nav className={mobile ? "open" : ""}>
          <a href="#home" className={route === "home" ? "active" : ""}>
            Discover
          </a>
          <a href="#tickets">Giza Zoo</a>
          <a href="#pass">My passes</a>
        </nav>
        <div className="header-right">
          <span className="currency">EGP · EN</span>
          <button
            className="bag"
            onClick={() => go("basket")}
            aria-label={`Basket, ${count} items`}
          >
            <ShoppingBag size={20} />
            {count > 0 && <b>{count}</b>}
          </button>
          <button
            className="mobile-menu"
            aria-label="Toggle menu"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {route === "home" ? (
        <main>
          <section className="hero">
            <img
              className="hero-img"
              src={images.hero}
              alt="Illustrated lion resting in a lush, sunlit landscape"
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <div className="eyebrow light">
                <span /> LESS PLANNING. MORE LIVING.
              </div>
              <h1>
                A little escape.
                <br />A lasting <em>memory.</em>
              </h1>
              <p>
                Wild encounters. Front-row moments. New perspectives.
                <br className="desktop" /> Your next great day starts with
                QPASS.
              </p>
              <a
                className="button cream"
                href="#destinations"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("destinations")
                    .scrollIntoView({ behavior: "smooth" });
                }}
              >
                Find your next adventure <ArrowUpRight size={19} />
              </a>
              <div className="hero-note">
                <ShieldCheck size={17} /> One pass. A world of possibilities.
              </div>
            </div>
            <div className="hero-caption">
              <span>IN THE SPOTLIGHT</span>
              <strong>Closer to the wild.</strong>
              <a href="#tickets">
                Discover Giza Zoo <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="hero-counter">
              <span>01</span> / 04 <i />
            </div>
          </section>
          <section className="trust-strip">
            <span>
              <Ticket /> Your whole day, one pass
            </span>
            <span>
              <ShieldCheck /> Simple & secure booking
            </span>
            <span>
              <Sparkles /> Experiences worth keeping
            </span>
            <span className="made">
              Made for making memories <Heart size={16} />
            </span>
          </section>
          <section className="destinations section" id="destinations">
            <div className="section-heading">
              <div>
                <div className="eyebrow">GO SOMEWHERE GOOD</div>
                <h2>What’s your kind of day?</h2>
              </div>
              <p>
                Something wild. Something loud. Something new.
                <br />
                Find a little more of what makes you feel alive.
              </p>
            </div>
            <div className="destination-grid">
              {destinations.map((d, i) => (
                <button
                  key={d.name}
                  className="destination-card"
                  onClick={() =>
                    d.live
                      ? go("tickets")
                      : setNotice(
                          `${d.name} is coming soon. Explore Giza Zoo today!`,
                        )
                  }
                >
                  <div className="destination-image">
                    <img src={d.image} alt={d.name} />
                    <span className={"badge " + (!d.live ? "muted" : "")}>
                      {d.live ? "NOW EXPLORING" : "COMING SOON"}
                    </span>
                    <span className="card-arrow">
                      <ArrowUpRight size={20} />
                    </span>
                    <div className="image-caption">{d.tag}</div>
                  </div>
                  <div className="card-meta">
                    <span>{d.type}</span>
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{d.name}</h3>
                  <div className="card-bottom">
                    <span>
                      <MapPin size={13} />
                      {d.location}
                    </span>
                    {d.live && (
                      <span>
                        From <strong>EGP {d.price}</strong>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
          <section className="wild-banner section">
            <div className="wild-art">
              <Leaf size={72} strokeWidth={1} />
            </div>
            <div>
              <div className="eyebrow">ONE DAY. SO MANY POSSIBILITIES.</div>
              <h2>Make a day of it.</h2>
              <p>
                A zoo ticket is just the beginning. Add a wild encounter, a
                delicious
                <br className="desktop" /> detour, or a little longer to stay.
                Your day, your way.
              </p>
            </div>
            <a href="#tickets" className="button green">
              Explore Giza Zoo <ArrowUpRight size={19} />
            </a>
          </section>
          <section className="steps section">
            <div>
              <span>01 / DISCOVER</span>
              <h3>Find your happy place.</h3>
              <p>Explore destinations and pick your kind of adventure.</p>
            </div>
            <div>
              <span>02 / MAKE IT YOURS</span>
              <h3>A day with your name on it.</h3>
              <p>Mix tickets, experiences, and little extras in one basket.</p>
            </div>
            <div>
              <span>03 / JUST SHOW UP</span>
              <h3>Good days. Zero fuss.</h3>
              <p>Your digital pass keeps everything in one easy place.</p>
            </div>
          </section>
        </main>
      ) : (
        <main className="inner-main">
          {tabs.some((t) => t[0] === route) ? (
            <>
              <a className="back-link" href="#home">
                <ArrowLeft size={15} /> All destinations
              </a>
              <section className="zoo-heading">
                <div>
                  <div className="eyebrow">A WILD LITTLE ESCAPE</div>
                  <h1>A day closer to nature.</h1>
                  <p>
                    <MapPin size={15} /> Giza Zoo, Egypt <span>·</span> Open
                    daily, 9:00 am – 5:00 pm
                  </p>
                </div>
                <img src={images.zoo} alt="A day in the wild" />
              </section>
              <div className="booking-layout">
                <div>
                  <div className="tabs">
                    {tabs.map(([id, label, Icon]) => (
                      <a
                        className={route === id ? "selected" : ""}
                        href={"#" + id}
                        key={id}
                      >
                        <Icon size={17} />
                        {label}
                      </a>
                    ))}
                  </div>
                  <div className="product-intro">
                    <div className="eyebrow">BUILD YOUR PERFECT DAY</div>
                    <h2>
                      {
                        {
                          tickets: "Let the adventure begin.",
                          experiences: "Meet your wild side.",
                          restaurants: "A delicious little detour.",
                          hotel: "Stay a little longer.",
                        }[route]
                      }
                    </h2>
                    <p>
                      {
                        {
                          tickets:
                            "Choose your entry passes, then add a little something extra.",
                          experiences:
                            "Unforgettable moments with extraordinary animals. Entry ticket required.",
                          restaurants:
                            "Fresh flavours and green surroundings. Pre-book your perfect pause.",
                          hotel:
                            "Turn a great day into a beautiful getaway. Mock accommodation near the zoo.",
                        }[route]
                      }
                    </p>
                  </div>
                  {route !== "tickets" && (
                    <img
                      className="category-image"
                      src={
                        images[
                          route === "experiences"
                            ? "giraffe"
                            : route === "restaurants"
                              ? "food"
                              : "hotel"
                        ]
                      }
                      alt={route}
                    />
                  )}
                  <div className="product-list">
                    {products[route].map((p) => (
                      <div className="product" key={p.id}>
                        <div>
                          <h3>{p.name}</h3>
                          <p>{p.desc}</p>
                          <strong>
                            EGP {money(p.price)}{" "}
                            <small>
                              / {route === "hotel" ? "night" : "person"}
                            </small>
                          </strong>
                        </div>
                        <button
                          className={
                            "add-button " + (cart[p.id] ? "added" : "")
                          }
                          onClick={() => {
                            update(p.id, 1);
                            setNotice(`${p.name} added to your day`);
                          }}
                        >
                          {cart[p.id] ? (
                            <Check size={16} />
                          ) : (
                            <Plus size={16} />
                          )}{" "}
                          {cart[p.id]
                            ? `Add another (${cart[p.id]})`
                            : "Add to day"}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="info-box">
                    <Leaf size={22} />
                    <div>
                      <strong>A little planning goes a long way.</strong>
                      <p>
                        {route === "tickets"
                          ? "Your day pass includes general zoo admission. Experiences, food, and stays are booked separately."
                          : route === "hotel"
                            ? "Check-in from 3 pm on your selected date. Check-out at 11 am the next day."
                            : "Select your visit date in your basket. Experience slots and restaurant bookings are illustrative in this prototype."}
                      </p>
                    </div>
                  </div>
                </div>
                <aside className="summary">
                  {summary}
                  <button
                    className="button green full"
                    disabled={!count}
                    onClick={() => go("basket")}
                  >
                    View basket <ArrowRight size={17} />
                  </button>
                  <small className="secure">
                    <ShieldCheck size={14} /> Mock booking · No real charges
                  </small>
                </aside>
              </div>
            </>
          ) : route === "basket" ? (
            <>
              <a className="back-link" href="#tickets">
                <ArrowLeft size={15} /> Keep exploring
              </a>
              <div className="page-title">
                <div className="eyebrow">YOUR NEXT GREAT DAY</div>
                <h1>A basket full of memories.</h1>
                <p>One destination. All your favourite things.</p>
              </div>
              <div className="basket-layout">
                <section className="summary basket-summary">
                  {summary}
                  {!count && (
                    <a className="button green" href="#tickets">
                      Explore tickets <ArrowRight size={16} />
                    </a>
                  )}
                </section>
                <aside className="checkout-info">
                  <Ticket size={32} />
                  <h2>Good times ahead.</h2>
                  <p>
                    Your tickets and extras will be brought together in one
                    digital pass.
                  </p>
                  {count > 0 && !hasTicket && (
                    <p className="warning">
                      Please add a zoo entry ticket before checkout.
                    </p>
                  )}
                  <button
                    className="button green full"
                    disabled={!count}
                    onClick={() => go(hasTicket ? "checkout" : "tickets")}
                  >
                    {hasTicket
                      ? "Continue to checkout"
                      : "Choose entry tickets"}
                    <ArrowRight size={17} />
                  </button>
                  <a className="text-link" href="#experiences">
                    Add an animal experience <Plus size={15} />
                  </a>
                  <small>All prices in EGP. No hidden fees.</small>
                </aside>
              </div>
            </>
          ) : route === "checkout" ? (
            <>
              <a className="back-link" href="#basket">
                <ArrowLeft size={15} /> Back to basket
              </a>
              <div className="page-title">
                <div className="eyebrow">ALMOST ADVENTURE TIME</div>
                <h1>Make it official.</h1>
                <p>A few details, and your day is ready.</p>
              </div>
              {!count ? (
                <div className="empty-state">
                  <ShoppingBag />
                  <h2>Your basket is waiting.</h2>
                  <a className="button green" href="#tickets">
                    Choose your tickets
                  </a>
                </div>
              ) : (
                <div className="booking-layout">
                  <form className="checkout-form" onSubmit={complete}>
                    <h2>Who’s coming along?</h2>
                    <label>
                      Full name
                      <input
                        required
                        autoComplete="name"
                        placeholder="Your full name"
                        value={guest.name}
                        onChange={(e) =>
                          setGuest({ ...guest, name: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Email address
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={guest.email}
                        onChange={(e) =>
                          setGuest({ ...guest, email: e.target.value })
                        }
                      />
                    </label>
                    <div className="info-box">
                      <ShieldCheck />
                      <div>
                        <strong>This is a prototype booking.</strong>
                        <p>
                          No payment details needed. Nothing will be charged and
                          no email will be sent. Your pass is saved only on this
                          device.
                        </p>
                      </div>
                    </div>
                    <label className="checkbox">
                      <input type="checkbox" required /> I understand this is a
                      demo and not a valid admission ticket.
                    </label>
                    <button className="button green full" type="submit">
                      Complete demo booking <ArrowRight size={17} />
                    </button>
                  </form>
                  <aside className="summary">{summary}</aside>
                </div>
              )}
            </>
          ) : route === "pass" || route === "souvenir" ? (
            booking ? (
              <>
                <div className="success-icon">
                  <Check />
                </div>
                <div className="page-title centered">
                  <div className="eyebrow">
                    {route === "pass"
                      ? "LET THE MEMORIES BEGIN"
                      : "A LITTLE SOMETHING TO KEEP"}
                  </div>
                  <h1>
                    {route === "pass"
                      ? "Your day is all set."
                      : "Some days stay with you."}
                  </h1>
                  <p>
                    {route === "pass"
                      ? "Your adventure, all in one pass. Keep it close."
                      : "A souvenir of your next wild adventure."}
                  </p>
                </div>
                <div
                  className={
                    "digital-pass " + (route === "souvenir" ? "souvenir" : "")
                  }
                >
                  <div className="pass-picture">
                    <img
                      src={images[route === "souvenir" ? "giraffe" : "zoo"]}
                      alt="Giza Zoo keepsake"
                    />
                    <span className="logo">
                      Q<span>PASS</span>
                    </span>
                    <div>
                      <div className="eyebrow light">
                        {route === "souvenir"
                          ? "THE SOUVENIR EDITION"
                          : "YOUR DIGITAL DAY PASS"}
                      </div>
                      <h2>Giza Zoo</h2>
                      <p>A day closer to nature.</p>
                    </div>
                  </div>
                  <div className="pass-details">
                    <span className="demo-tag">
                      DEMO ONLY · NOT VALID FOR ENTRY
                    </span>
                    <h3>{booking.name}</h3>
                    <p>
                      <CalendarDays size={16} />
                      {formatDate(booking.date)}
                    </p>
                    {booking.items.map((p) => (
                      <div className="pass-line" key={p.id}>
                        <span>
                          {p.quantity} × {p.name}
                        </span>
                        <strong>EGP {money(p.quantity * p.price)}</strong>
                      </div>
                    ))}
                    <div className="qr-area">
                      <QRCode value={booking.id} />
                      <div>
                        <strong>{booking.id}</strong>
                        <small>Demo QR · Mock booking</small>
                        <small>Booking total: EGP {money(booking.total)}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pass-actions">
                  <button
                    className="button green"
                    onClick={() => window.print()}
                  >
                    <Download size={17} /> Save / print{" "}
                    {route === "souvenir" ? "souvenir" : "pass"}
                  </button>
                  <a
                    className="button outline"
                    href={route === "pass" ? "#souvenir" : "#pass"}
                  >
                    {route === "pass"
                      ? "View souvenir ticket"
                      : "View digital pass"}
                    <ArrowUpRight size={17} />
                  </a>
                </div>
                <a className="back-link centered" href="#home">
                  Discover your next adventure <ArrowRight size={15} />
                </a>
              </>
            ) : (
              <div className="empty-state">
                <Ticket size={40} />
                <h1>Your memories start here.</h1>
                <p>
                  Complete a demo booking to find your digital pass and souvenir
                  ticket here.
                </p>
                <a className="button green" href="#tickets">
                  Explore Giza Zoo <ArrowRight size={17} />
                </a>
              </div>
            )
          ) : (
            <div className="empty-state">
              <Compass size={40} />
              <h1>Let’s get you back on track.</h1>
              <a href="#home" className="button green">
                Discover QPASS
              </a>
            </div>
          )}
        </main>
      )}
      <footer>
        <div className="footer-top">
          <a className="logo" href="#home">
            Q<span>PASS</span>
            <i />
          </a>
          <p>Less planning. More living.</p>
          <a href="#home">
            Go make a memory <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} QPASS. A world of good days.</span>
          <span>Prototype experience · Mock bookings only</span>
          <span>
            Made with a little wonder <Sparkles size={12} />
          </span>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
function QRCode({ value }) {
  return (
    <QRCodeSVG
      className="qr"
      value={`QPASS DEMO | ${value} | NOT VALID FOR ENTRY`}
      size={120}
      marginSize={2}
      fgColor="#163e35"
      role="img"
      aria-label="Demo booking QR code"
    />
  );
}
createRoot(document.getElementById("root")).render(<App />);
