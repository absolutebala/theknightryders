import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with The Knight Ryders, a group bike riding community in Chennai. Ask about joining, upcoming rides or collaborations.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section style={{ paddingTop: 70, paddingBottom: 90 }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span className="eyebrow-sm">Get in touch</span>
          <h1 className="section-title">Contact Us</h1>
          <p className="section-sub" style={{ margin: "14px auto 0", maxWidth: 480 }}>
            Questions about joining, upcoming rides or collaborations? Send us a message and we&apos;ll get back to you.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
