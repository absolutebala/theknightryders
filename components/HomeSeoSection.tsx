const FAQS = [
  {
    q: "What is The Knight Ryders?",
    a: "The Knight Ryders is a group bike riding community in Chennai for Honda CB350 owners. We organise group rides, long-distance tours and social-cause rides, and have ridden together to destinations across Tamil Nadu and beyond.",
  },
  {
    q: "How do I join the Chennai bike riding community?",
    a: "Sign up on this website and a club admin will review your request. You can also message the club on WhatsApp at +91 6381 890 182.",
  },
  {
    q: "Who can join the group rides?",
    a: "The club is built around Honda CB350 owners. Members can request to join each upcoming ride from the ride's page.",
  },
  {
    q: "Where can I see upcoming and past group rides?",
    a: "Upcoming group rides are listed on the Upcoming Rides page, and every completed ride, with its story, route and photos, is on the Past Rides page.",
  },
  {
    q: "Does the club support social causes?",
    a: "Yes. Through our Ride for the Cause initiative, organisations can collaborate with the club on awareness rides.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomeSeoSection() {
  return (
    <section style={{ background: "var(--mint)" }} id="about-the-community">
      <div className="container" style={{ maxWidth: 900 }}>
        <span className="eyebrow-sm">Chennai&apos;s Honda CB350 riders</span>
        <h2 className="section-title">A Group Bike Riding Community in Chennai</h2>
        <p style={{ color: "var(--dark)", fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          The Knight Ryders is a group bike riding community based in Chennai. What started as a
          handful of Honda CB350 owners has grown into a Chennai bike riding community that rides
          together, from quick weekend outings to multi-day tours, and supports social causes
          along the way.
        </p>
        <p style={{ color: "var(--dark)", fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
          Browse our <a href="/rides/upcoming" style={{ color: "var(--cta-blue)", fontWeight: 700 }}>upcoming group rides</a>,
          read the stories from our <a href="/rides/past" style={{ color: "var(--cta-blue)", fontWeight: 700 }}>past rides</a>,
          or <a href="/about" style={{ color: "var(--cta-blue)", fontWeight: 700 }}>learn more about the club</a>.
        </p>

        <h3 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 14 }}>Frequently asked questions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((f) => (
            <details
              key={f.q}
              style={{ background: "var(--white)", border: "1px solid #dce8e3", borderRadius: 10, padding: "12px 16px" }}
            >
              <summary style={{ fontWeight: 700, color: "var(--navy)", cursor: "pointer" }}>{f.q}</summary>
              <p style={{ margin: "10px 0 2px", color: "var(--dark)", lineHeight: 1.7 }}>{f.a}</p>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      </div>
    </section>
  );
}
