"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CrownBadge from "@/components/CrownBadge";

type Props = {
  memberId: string;
  isOwner: boolean;
  fullName: string | null;
  profilePhotoUrl: string | null;
  showCrown?: boolean;
};

const GOLD = "#d4af37";

export default function EliteAvatarEditor({
  memberId,
  isOwner,
  fullName,
  profilePhotoUrl,
  showCrown = false,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploading(false);
      setError("You need to be signed in to upload a photo.");
      return;
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const path = `${user.id}/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: updateError } = await supabase
      .from("members")
      .update({ profile_photo_url: publicUrlData.publicUrl })
      .eq("id", memberId);

    setUploading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <div className="elite-avatar-container" style={{ position: "relative" }}>
        {profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profilePhotoUrl} alt={fullName ?? "Rider"} />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#07090e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: GOLD,
              fontSize: 40,
              fontWeight: 800,
              border: "2px solid #07090e",
            }}
          >
            {(fullName ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        {isOwner && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
              id="elite-avatar-upload"
            />
            <label
              htmlFor="elite-avatar-upload"
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: GOLD,
                color: "#07090e",
                border: "2px solid #07090e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {uploading ? "…" : "\u270E"}
            </label>
          </>
        )}
        {showCrown && <CrownBadge size={34} />}
      </div>
      {error && <div style={{ color: "#e08a7d", fontSize: 11, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
