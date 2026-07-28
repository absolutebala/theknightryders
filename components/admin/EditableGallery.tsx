"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

type Props = {
  sectionKey: string;
  images: GalleryImage[];
  isAdmin: boolean;
  gridClassName: string;
  captionAlwaysVisible?: boolean;
  singleImage?: boolean;
};

export default function EditableGallery({
  sectionKey,
  images,
  isAdmin,
  gridClassName,
  captionAlwaysVisible,
  singleImage,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [managing, setManaging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const path = `${sectionKey}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
    const { error: uploadError } = await supabase.storage
      .from("homepage")
      .upload(path, file);

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("homepage").getPublicUrl(path);
    const nextSortOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;

    const { error: insertError } = await supabase.from("homepage_images").insert({
      section_key: sectionKey,
      image_url: publicUrlData.publicUrl,
      sort_order: nextSortOrder,
    });

    setUploading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleRemove(imageId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("homepage_images").delete().eq("id", imageId);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const a = images[index];
    const b = images[targetIndex];
    const supabase = createClient();

    const { error: err1 } = await supabase
      .from("homepage_images")
      .update({ sort_order: b.sort_order })
      .eq("id", a.id);
    const { error: err2 } = await supabase
      .from("homepage_images")
      .update({ sort_order: a.sort_order })
      .eq("id", b.id);

    if (err1 || err2) {
      setError((err1 ?? err2)?.message ?? "Failed to reorder");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {isAdmin && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setManaging((m) => !m)}
            className="btn btn-outline"
            style={{ padding: "8px 20px", fontSize: 12.5 }}
          >
            {managing ? "Done Managing Photos" : "Manage Photos"}
          </button>
        </div>
      )}

      <div className={singleImage ? "" : gridClassName}>
        {images.map((img, i) => (
          <figure
            key={img.id}
            style={
              singleImage
                ? { position: "relative", margin: 0 }
                : { position: "relative" }
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.image_url}
              alt={img.caption ?? ""}
              style={singleImage ? { borderRadius: 14, width: "100%" } : undefined}
            />
            {(img.caption || captionAlwaysVisible) && <figcaption>{img.caption}</figcaption>}

            {isAdmin && managing && (
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  display: "flex",
                  gap: 4,
                }}
              >
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Move left"
                      onClick={() => handleMove(i, -1)}
                      disabled={i === 0}
                      style={smallBtnStyle}
                    >
                      &#8592;
                    </button>
                    <button
                      type="button"
                      aria-label="Move right"
                      onClick={() => handleMove(i, 1)}
                      disabled={i === images.length - 1}
                      style={smallBtnStyle}
                    >
                      &#8594;
                    </button>
                  </>
                )}
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => handleRemove(img.id)}
                  style={{ ...smallBtnStyle, background: "#a3312a", color: "#fff" }}
                >
                  &#10005;
                </button>
              </div>
            )}
          </figure>
        ))}
      </div>

      {isAdmin && managing && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: "none" }}
            id={`upload-${sectionKey}`}
          />
          <label
            htmlFor={`upload-${sectionKey}`}
            className="btn btn-amber"
            style={{ padding: "9px 22px", fontSize: 13, cursor: "pointer", display: "inline-block" }}
          >
            {uploading ? "Uploading…" : "+ Add Photo"}
          </label>
          {error && <div style={{ color: "#a3312a", fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

const smallBtnStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 6,
  border: "none",
  background: "rgba(0,0,0,.65)",
  color: "#fff",
  fontSize: 12,
  cursor: "pointer",
};
