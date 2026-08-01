import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import EditableField from "@/components/admin/EditableField";
import EditableGallery from "@/components/admin/EditableGallery";

const SECTION_KEY = "media";

export default async function MediaPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";

  const [authResult, isAdminResult, contentResult, imagesResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
    supabase.from("homepage_content").select("title, subtitle, body").eq("section_key", SECTION_KEY).maybeSingle(),
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
  const content = contentResult.data;
  const images = imagesResult.data ?? [];

  return (
    <>
      <section style={{ paddingTop: 90, paddingBottom: 20 }}>
        <div className="container" style={{ textAlign: "center" }}>
          <EditableField
            sectionKey={SECTION_KEY}
            column="subtitle"
            value={content?.subtitle ?? null}
            isAdmin={isAdmin}
            as="span"
            className="eyebrow-sm"
          />
          <EditableField
            sectionKey={SECTION_KEY}
            column="title"
            value={content?.title ?? null}
            isAdmin={isAdmin}
            as="h1"
            className="section-title"
          />
          <EditableField
            sectionKey={SECTION_KEY}
            column="body"
            value={content?.body ?? null}
            isAdmin={isAdmin}
            as="p"
            className="section-sub"
            multiline
            style={{ maxWidth: 560, margin: "16px auto 0" }}
          />
        </div>
      </section>

      <section style={{ paddingBottom: 20 }}>
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

      <section style={{ paddingBottom: 80 }}>
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
