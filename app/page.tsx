import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import EditableField from "@/components/admin/EditableField";
import EditableGallery from "@/components/admin/EditableGallery";
import HeroBannerEditor from "@/components/admin/HeroBannerEditor";
import HeroPromoSlider from "@/components/admin/HeroPromoSlider";

async function getSection(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string
) {
  const [{ data: content }, { data: images }] = await Promise.all([
    supabase
      .from("homepage_content")
      .select("section_key, title, subtitle, body")
      .eq("section_key", key)
      .maybeSingle(),
    supabase
      .from("homepage_images")
      .select("id, image_url, caption, sort_order")
      .eq("section_key", key)
      .order("sort_order", { ascending: true }),
  ]);

  return { content, images: images ?? [] };
}

export default async function HomePage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const editModeOn = cookieStore.get("edit_mode")?.value === "true";

  // All of these are independent of one another -- run them concurrently
  // instead of waiting on each one in turn. This is the single biggest
  // lever for homepage load time, since it was previously ~14 sequential
  // database round-trips.
  const [
    authResult,
    isAdminResult,
    statsResult,
    latestRideResult,
    heroContentResult,
    heroImageResult,
    heroPromoResult,
    promoTitleResult,
    birthdayMembersResult,
    birthdayWishResult,
    milestone,
    rideForCause,
    awards,
    gallery,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
    supabase.from("homepage_stats").select("rides_count, total_km, riders_count").maybeSingle(),
    supabase
      .from("rides")
      .select("title, hero_image_url, hero_image_position")
      .not("hero_image_url", "is", null)
      .order("ride_date", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("homepage_content").select("hero_source").eq("section_key", "hero").maybeSingle(),
    supabase.from("homepage_images").select("image_url, image_position").eq("section_key", "hero").maybeSingle(),
    supabase
      .from("homepage_images")
      .select("id, image_url, sort_order")
      .eq("section_key", "hero_promo")
      .order("sort_order", { ascending: true }),
    supabase.from("homepage_content").select("title").eq("section_key", "hero_promo").maybeSingle(),
    supabase.rpc("get_members_with_birthday_offset"),
    supabase.rpc("get_random_birthday_wish"),
    getSection(supabase, "milestone"),
    getSection(supabase, "ride_for_cause"),
    getSection(supabase, "awards"),
    getSection(supabase, "gallery"),
  ]);

  const {
    data: { user },
  } = authResult;
  const isAdmin = !!user && !!isAdminResult.data && editModeOn;

  const stats = statsResult.data;
  const latestRide = latestRideResult.data;
  const heroContent = heroContentResult.data;
  const heroImage = heroImageResult.data;
  const heroPromoImages = heroPromoResult.data ?? [];
  const promoTitle = promoTitleResult.data?.title ?? "Promo Code : TKRPride";
  type BirthdayOffset = {
    id: string;
    full_name: string | null;
    profile_photo_url: string | null;
    days_diff: number;
  };
  const allBirthdayOffsets: BirthdayOffset[] = birthdayMembersResult.data ?? [];

  const todaysBirthdays = allBirthdayOffsets.filter((m) => m.days_diff === 0);
  const upcoming = allBirthdayOffsets
    .filter((m) => m.days_diff > 0)
    .sort((a, b) => a.days_diff - b.days_diff);
  const passed = allBirthdayOffsets
    .filter((m) => m.days_diff < 0)
    .sort((a, b) => b.days_diff - a.days_diff); // closest to today first

  let birthdayMembers: BirthdayOffset[] = [];
  if (todaysBirthdays.length > 0) {
    birthdayMembers = todaysBirthdays;
  } else if (upcoming.length > 0 && upcoming[0].days_diff <= 2) {
    birthdayMembers = upcoming.filter((m) => m.days_diff === upcoming[0].days_diff);
  } else if (passed.length > 0 && Math.abs(passed[0].days_diff) <= 2) {
    birthdayMembers = passed.filter((m) => m.days_diff === passed[0].days_diff);
  }

  const promoMode: "promo" | "birthday" = birthdayMembers.length > 0 ? "birthday" : "promo";
  const birthdayWish =
    birthdayWishResult.data ?? "Wish you all the success and happiest life as we have on the road ;)";

  const heroSource = (heroContent?.hero_source ?? "auto") as "auto" | "custom";
  const useCustomHero = heroSource === "custom" && !!heroImage?.image_url;
  const heroImageUrl = useCustomHero ? heroImage!.image_url : latestRide?.hero_image_url;
  const heroImagePosition = useCustomHero
    ? heroImage!.image_position
    : latestRide?.hero_image_position ?? 50;

  return (
    <>
      <div className="hero-section-wrapper">
      <section
        className="hero"
        style={
          heroImageUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(5,8,15,.35), rgba(5,8,15,.55)), url('${heroImageUrl}')`,
                backgroundPosition: `center ${heroImagePosition}%`,
              }
            : undefined
        }
      >
        <HeroBannerEditor
          isAdmin={isAdmin}
          heroSource={heroSource}
          customImageUrl={heroImage?.image_url ?? null}
          customImagePosition={heroImage?.image_position ?? 50}
          latestRideImageUrl={latestRide?.hero_image_url ?? null}
        />
        <div className="hero-content-row">
        <div className="hero-inner">
          <h1>
            <span className="hero-lines-desktop">
              <span className="hero-line">Ride till the last mile.</span>
              <span className="hero-line">An exclusive club for</span>
              <span className="hero-line highlight">Honda CB350!</span>
            </span>
            <span className="hero-lines-mobile">
              <span className="hero-line">Ride till</span>
              <span className="hero-line">last mile.</span>
              <span className="hero-line">an exclusive club</span>
              <span className="hero-line highlight">for Honda CB350!</span>
            </span>
          </h1>
          <a href="/about" className="btn btn-outline">
            Know about our club
          </a>
          <div className="stats">
            <div>
              <div className="stat-num">{stats?.rides_count ?? 0}</div>
              <div className="stat-label">Rides</div>
            </div>
            <div>
              <div className="stat-num">{(stats?.total_km ?? 0).toLocaleString("en-IN")}</div>
              <div className="stat-label">Kilometers Covered</div>
            </div>
            <div>
              <div className="stat-num">{stats?.riders_count ?? 0}</div>
              <div className="stat-label">Riders</div>
            </div>
          </div>
        </div>
        <div className="hero-promo-zone">
          <HeroPromoSlider
            images={heroPromoImages}
            isAdmin={isAdmin}
            promoMode={promoMode}
            promoTitle={promoTitle}
            birthdayMembers={birthdayMembers}
            birthdayWish={birthdayWish}
          />
        </div>
        </div>
      </section>
      </div>

      {/* MILESTONE */}
      <section className="about" id="about">
        <div className="container about-grid">
          <div>
            {isAdmin ? (
              <EditableGallery
                sectionKey="milestone"
                images={milestone.images.slice(0, 1)}
                isAdmin={isAdmin}
                gridClassName="gallery-grid"
                singleImage
              />
            ) : (
              milestone.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={milestone.images[0].image_url} alt="Milestone" />
              )
            )}
          </div>
          <div>
            <EditableField
              sectionKey="milestone"
              column="subtitle"
              value={milestone.content?.subtitle ?? null}
              isAdmin={isAdmin}
              as="span"
              className="eyebrow-sm"
              style={{ textAlign: "left" }}
            />
            <EditableField
              sectionKey="milestone"
              column="title"
              value={milestone.content?.title ?? null}
              isAdmin={isAdmin}
              as="h2"
            />
            <div style={{ whiteSpace: "pre-line" }}>
              <EditableField
                sectionKey="milestone"
                column="body"
                value={milestone.content?.body ?? null}
                isAdmin={isAdmin}
                as="p"
                multiline
              />
            </div>
          </div>
        </div>
      </section>

      {/* RIDE FOR THE CAUSE */}
      <section id="ride-for-cause">
        <div className="container">
          <EditableField
            sectionKey="ride_for_cause"
            column="subtitle"
            value={rideForCause.content?.subtitle ?? null}
            isAdmin={isAdmin}
            as="span"
            className="eyebrow-sm"
          />
          <EditableField
            sectionKey="ride_for_cause"
            column="title"
            value={rideForCause.content?.title ?? null}
            isAdmin={isAdmin}
            as="h2"
            className="section-title"
          />
          <div style={{ whiteSpace: "pre-line" }}>
            <EditableField
              sectionKey="ride_for_cause"
              column="body"
              value={rideForCause.content?.body ?? null}
              isAdmin={isAdmin}
              as="p"
              multiline
              className="section-sub"
            />
          </div>
          <EditableGallery
            sectionKey="ride_for_cause"
            images={rideForCause.images}
            isAdmin={isAdmin}
            gridClassName="gallery-grid small"
          />
        </div>
      </section>

      {/* AWARDS */}
      <section style={{ background: "var(--mint)" }} id="awards">
        <div className="container">
          <EditableField
            sectionKey="awards"
            column="subtitle"
            value={awards.content?.subtitle ?? null}
            isAdmin={isAdmin}
            as="span"
            className="eyebrow-sm"
          />
          <EditableField
            sectionKey="awards"
            column="title"
            value={awards.content?.title ?? null}
            isAdmin={isAdmin}
            as="h2"
            className="section-title"
          />
          <EditableGallery
            sectionKey="awards"
            images={awards.images}
            isAdmin={isAdmin}
            gridClassName="gallery-grid small"
          />
        </div>
      </section>

      {/* 75 HONDA BIKES GALLERY */}
      <section id="gallery">
        <div className="container">
          <EditableField
            sectionKey="gallery"
            column="subtitle"
            value={gallery.content?.subtitle ?? null}
            isAdmin={isAdmin}
            as="span"
            className="eyebrow-sm"
          />
          <EditableField
            sectionKey="gallery"
            column="title"
            value={gallery.content?.title ?? null}
            isAdmin={isAdmin}
            as="h2"
            className="section-title"
          />
          <EditableField
            sectionKey="gallery"
            column="body"
            value={gallery.content?.body ?? null}
            isAdmin={isAdmin}
            as="p"
            className="section-sub"
          />
          <EditableGallery
            sectionKey="gallery"
            images={gallery.images}
            isAdmin={isAdmin}
            gridClassName="gallery-grid"
          />
        </div>
      </section>
    </>
  );
}
