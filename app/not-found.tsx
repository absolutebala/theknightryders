export default function NotFound() {
  return (
    <section style={{ paddingTop: 110, paddingBottom: 110 }}>
      <div className="container" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <span className="eyebrow-sm">The Knight Ryders</span>
        <h1 className="section-title" style={{ fontSize: 64, marginBottom: 4 }}>404</h1>
        <p style={{ fontSize: 19, fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>
          Looks like you took a wrong turn.
        </p>
        <p className="section-sub" style={{ marginBottom: 34 }}>
          This page doesn&apos;t exist -- it may have moved when we rebuilt the
          site. Let&apos;s get you back on the road.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <a href="/" className="btn btn-amber" style={{ padding: "12px 26px" }}>
            Back to Home
          </a>
          <a href="/rides/past" className="btn btn-outline" style={{ padding: "12px 26px" }}>
            Past Rides
          </a>
          <a href="/members-directory" className="btn btn-outline" style={{ padding: "12px 26px" }}>
            Members
          </a>
        </div>
      </div>
    </section>
  );
}
