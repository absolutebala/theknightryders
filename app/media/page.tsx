import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import EditableGallery from "@/components/admin/EditableGallery";

const SECTION_KEY = "media";

export default async function MediaPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";

  const [authResult, isAdminResult, imagesResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
    supabase
      .from("homepage_images")
      .select("id, image_url, caption, sort_order")
      .eq("section_key", SECTION_KEY)
      .order("sort_order", { ascending: true }),
  ]);

  const {
    data: { user },
  } = authResult;
  const isAdmin = !!user && !!isAdminResult.data && editModeOn;
  const images = imagesResult.data ?? [];

  return (
    <>
      <section style={{ paddingTop: 90, paddingBottom: 60 }}>
        <div className="container">
          <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 20, textAlign: "center" }}>
            Listen
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            <div>
              <iframe
                title="Rainbow FM playlist"
                width="100%"
                height="300"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fthe-knight-ryders%2Fsets%2Frainbowfm&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                style={{ borderRadius: 10 }}
              />
            </div>
            <div>
              <iframe
                title="BigFM playlist"
                width="100%"
                height="300"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fbala-kandaswamy%2Fsets%2Fbigfm&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                style={{ borderRadius: 10 }}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: 40 }}>
        <div className="container" style={{ textAlign: "center" }}>
          <a
            href="https://www.youtube.com/@TheKnightRyders1"
            target="_blank"
            rel="noopener"
            className="btn btn-outline"
            style={{ display: "inline-block" }}
          >
            Watch Our Rides on YouTube
          </a>
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: 80 }}>
        <div className="container">
          <EditableGallery
            sectionKey={SECTION_KEY}
            images={images}
            isAdmin={isAdmin}
            gridClassName="gallery-grid"
          />
        </div>
      </section>
    </>
  );
}
