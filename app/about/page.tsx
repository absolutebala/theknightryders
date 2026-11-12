import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "About the Club",
  description:
    "The Knight Ryders is a group bike riding community in Chennai for Honda CB350 owners. Learn how we ride, the causes we support and how to join.",
  alternates: { canonical: "/about" },
};

const DOINGS = [
  { icon: "☕", title: "Weekend breakfast rides", text: "Easy Sunday rides out of Chennai: Pondicherry, Mahabalipuram, Vedanthangal and more. Good roads, hot coffee, better company." },
  { icon: "🏔️", title: "Hills & long tours", text: "From Yercaud and Kodaikanal to Munnar, Wayanad, Goa and Leh, we plan the routes, stays and stops so everyone rides together." },
  { icon: "🎗️", title: "Causes & rallies", text: "We ride for more than fun: social responsibility drives, the Pink Bikeathon and Independence Day rides with local institutions." },
  { icon: "🤝", title: "Riding with other clubs", text: "Joint rides with Honda BigWing chapters and fellow riding groups keep the wider Chennai biking community close." },
];

const VALUES = [
  { title: "Ride together, return together", text: "We start as a group, pace as a group and finish as a group. Nobody is left behind." },
  { title: "Safety is non-negotiable", text: "Full-face helmet, riding jacket, pants, boots and gloves. Every rider, every ride." },
  { title: "Every Knight is family", text: "New to group riding or a veteran of thousands of kilometres, there's a seat for you at the table." },
];

const TIMELINE = [
  { year: "2021", text: "The first breakfast ride to Tindivanam, and the start of a community. Kanchanagiri, Pondicherry and Yelagiri followed within months." },
  { year: "2022", text: "Down south to Rameshwaram and Kanyakumari, Munnar, Gandikota and Valparai, plus 25 Honda CB350s together on the road to Agumbe." },
  { year: "2023", text: "Goa, Wayanad and Mahabaleshwar, a Courtallam anniversary ride and the 50th ride milestone." },
  { year: "2024", text: "Varkala, Kodagu and Gokarna, with more coast, coffee country and kilometres than ever." },
  { year: "2025", text: "Meghamalai, Sakleshpur, Thekkady, Munroe Island and the Leh adventure." },
  { year: "2026", text: "Kodai, Horsley Hills, Valparai and still going. The road isn't done with us." },
];

export default async function AboutPage() {
  const supabase = await createClient();
  const [{ data: stats }, { data: rides }] = await Promise.all([
    supabase.from("homepage_stats").select("rides_count, total_km, riders_count").maybeSingle(),
    supabase
      .from("rides")
      .select("title, slug, hero_image_url")
      .eq("is_published", true)
      .not("hero_image_url", "is", null)
      .order("ride_date", { ascending: false })
      .limit(7),
  ]);
  const photos = (rides ?? []) as { title: string; slug: string; hero_image_url: string }[];
  const heroPhotos = photos.slice(0, 3);
  const galleryPhotos = photos.slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="ab-hero">
        <div className="container ab-hero-grid">
          <div>
            <span className="ab-eyebrow">About The Knight Ryders</span>
            <h1>
              A community of riders,
              <br />
              <span>not just a club.</span>
            </h1>
            <p>
              We&apos;re a group bike riding community in Chennai for Honda CB350 owners, bound by the road, the
              brand and the ride experiences we share together.
            </p>
            <div className="ab-hero-btns">
              <a href="/rides/upcoming" className="btn btn-amber">See Upcoming Rides</a>
              <a href="/signup" className="btn ab-btn-ghost">Join the Club</a>
            </div>
          </div>
          {heroPhotos.length > 0 && (
            <div className="ab-hero-photos">
              {heroPhotos.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.slug} src={p.hero_image_url} alt={`${p.title} - The Knight Ryders group ride`} className={i === 0 ? "big" : ""} />
              ))}
            </div>
          )}
        </div>

        <div className="container">
          <div className="ab-stats">
            <div><b>2021</b><span>Riding since</span></div>
            <div><b>{stats?.rides_count ?? 0}</b><span>Group rides</span></div>
            <div><b>{(stats?.total_km ?? 0).toLocaleString("en-IN")}</b><span>Kilometres together</span></div>
            <div><b>{stats?.riders_count ?? 0}</b><span>Riders</span></div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="ab-section">
        <div className="container ab-story">
          <div>
            <span className="ab-kicker">Our story</span>
            <h2>One ride. Then another. Then a family.</h2>
          </div>
          <div className="ab-story-text">
            <p>
              What started as a handful of riders heading out for a breakfast ride has grown into a group bike riding
              club that has covered thousands of kilometres together, taken on social causes, and built friendships one
              ride at a time.
            </p>
            <p>
              We ride because it&apos;s better together: the early starts, the chai stops, the hairpin bends and the
              stories on the way back. If you own a Honda CB350, you already belong on the road with us.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="ab-section">
        <div className="container">
          <div className="ab-head">
            <span className="ab-kicker">What we do together</span>
            <h2>More than just riding</h2>
          </div>
          <div className="ab-cards">
            {DOINGS.map((d) => (
              <div key={d.title} className="ab-card">
                <div className="ab-icon">{d.icon}</div>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="ab-section">
        <div className="container">
          <div className="ab-head">
            <span className="ab-kicker">How we ride</span>
            <h2>The Knight Ryders code</h2>
          </div>
          <div className="ab-values">
            {VALUES.map((v, i) => (
              <div key={v.title} className="ab-value">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {galleryPhotos.length > 0 && (
        <section className="ab-section ab-alt">
          <div className="container">
            <div className="ab-head">
              <span className="ab-kicker">On the road</span>
              <h2>Moments from our latest rides</h2>
            </div>
            <div className="ab-gallery">
              {galleryPhotos.map((p) => (
                <a key={p.slug} href={`/rides/${p.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.hero_image_url} alt={p.title} />
                  <span>{p.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TIMELINE */}
      <section className="ab-section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="ab-head">
            <span className="ab-kicker">Our journey</span>
            <h2>Year by year on the road</h2>
          </div>
          <div className="ab-timeline">
            {TIMELINE.map((t) => (
              <div key={t.year} className="ab-tl-item">
                <div className="ab-tl-year">{t.year}</div>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ab-cta">
        <div className="container">
          <h2>Your seat on the next ride is waiting.</h2>
          <p>Meet the riders, join a group ride from Chennai, or just say hello.</p>
          <div className="ab-hero-btns" style={{ justifyContent: "center" }}>
            <a href="/rides/upcoming" className="btn ab-btn-dark">Upcoming Rides</a>
            <a href="/members-directory" className="btn ab-btn-dark">Meet the Riders</a>
            <a href="/contact" className="btn ab-btn-dark">Contact Us</a>
          </div>
        </div>
      </section>
    </>
  );
}
