import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with The Knight Ryders, a group bike riding community in Chennai. Ask about joining, upcoming rides or collaborations.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: rides } = await supabase
    .from("rides")
    .select("title, hero_image_url")
    .eq("is_published", true)
    .not("hero_image_url", "is", null)
    .order("ride_date", { ascending: false })
    .limit(3);
  const photos = (rides ?? []) as { title: string; hero_image_url: string }[];

  return (
    <section className="contact-hero">
      <div className="container contact-wrap">
        <div className="contact-left">
          <span className="contact-eyebrow">Get in touch</span>
          <h1>
            Contact <span>Us</span>
          </h1>
          <p>
            Questions about joining, upcoming rides or collaborations? Send us a message and we&apos;ll get back to
            you.
          </p>

          {photos.length > 0 && (
            <div className="contact-photos">
              {photos.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p.hero_image_url} alt={`${p.title} - The Knight Ryders Honda CB350 ride`} className={i === 0 ? "big" : ""} />
              ))}
            </div>
          )}

          <div className="contact-chips">
            <a href="https://wa.me/916381890182" target="_blank" rel="noopener">
              <b>WhatsApp</b> +91 6381 890 182
            </a>
            <span>
              <b>Based in</b> Chennai, India
            </span>
          </div>
        </div>

        <div className="contact-right">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
