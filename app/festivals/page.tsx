import { createClient } from "@/lib/supabase/server";
import FestivalCard from "@/components/FestivalCard";

export default async function FestivalsPage() {
  const supabase = await createClient();

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: cards } = await supabase
    .from("holiday_card_images")
    .select("holiday_key, holiday_name, image_url, holiday_date, wish_text")
    .not("image_url", "is", null)
    .gte("holiday_date", todayStr)
    .order("holiday_date", { ascending: true });

  const festivals = (cards ?? []) as {
    holiday_key: string;
    holiday_name: string;
    image_url: string;
    holiday_date: string;
    wish_text: string | null;
  }[];

  return (
    <section style={{ paddingTop: 90, paddingBottom: 100 }}>
      <div className="container" style={{ textAlign: "center" }}>
        <span className="eyebrow-sm">Celebrate With Us</span>
        <h1 className="section-title">Festivals</h1>
        <p className="section-sub" style={{ maxWidth: 480, margin: "16px auto 0" }}>
          Upcoming festivals and holidays -- download any card to share.
        </p>
      </div>

      <div
        className="container"
        style={{
          marginTop: 40,
          background: "linear-gradient(160deg,#1a1032,#0c0e12)",
          borderRadius: 20,
          padding: "40px 24px",
        }}
      >
        {festivals.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,.6)" }}>
            No upcoming festival cards yet -- check back soon.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
            {festivals.map((f) => (
              <FestivalCard key={f.holiday_key} card={f} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
