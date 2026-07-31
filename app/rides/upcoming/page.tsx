export default function UpcomingRidesPage() {
  return (
    <section style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ textAlign: "center" }}>
        <span className="eyebrow-sm">What's Next</span>
        <h1 className="section-title">Upcoming Rides</h1>
        <p className="section-sub" style={{ maxWidth: 480, margin: "16px auto 0" }}>
          No upcoming rides scheduled for now. Check back soon, or watch the
          club's channels for the next announcement.
        </p>
      </div>
    </section>
  );
}
