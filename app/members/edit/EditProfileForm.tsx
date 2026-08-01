"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage, jpegFilename } from "@/lib/imageCompression";
import { deleteStorageFileFromUrl } from "@/lib/supabaseStorage";

type Member = {
  id: string;
  full_name: string | null;
  handle: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  why_joining: string | null;
  vehicle_number: string | null;
  address: string | null;
  profile_photo_url: string | null;
  social_links: Record<string, string> | null;
};

export default function EditProfileForm({
  member,
  isElite,
}: {
  member: Member;
  isElite: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: member.full_name ?? "",
    handle: member.handle ?? "",
    bio: member.bio ?? "",
    date_of_birth: member.date_of_birth ?? "",
    gender: member.gender ?? "",
    blood_group: member.blood_group ?? "",
    why_joining: member.why_joining ?? "",
    vehicle_number: member.vehicle_number ?? "",
    address: member.address ?? "",
    profile_photo_url: member.profile_photo_url ?? "",
    facebook: member.social_links?.facebook ?? "",
    instagram: member.social_links?.instagram ?? "",
    twitter: member.social_links?.twitter ?? "",
    youtube: member.social_links?.youtube ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

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

    const compressed = await compressImage(file);
    const cleanName = jpegFilename(file.name.replace(/[^a-zA-Z0-9.\-_]/g, ""));
    const path = `${user.id}/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, compressed, { upsert: true, contentType: "image/jpeg" });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    update("profile_photo_url", publicUrlData.publicUrl);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();

    // Deliberately only sends editable fields -- ride_count/ride_list are
    // never included here, and the database's column-level GRANTs would
    // reject them even if they were.
    const { error } = await supabase
      .from("members")
      .update({
        full_name: form.full_name || null,
        ...(isElite && { handle: form.handle || null }),
        bio: form.bio || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        why_joining: form.why_joining || null,
        vehicle_number: form.vehicle_number || null,
        address: form.address || null,
        profile_photo_url: form.profile_photo_url || null,
        social_links: {
          ...(form.facebook && { facebook: form.facebook }),
          ...(form.instagram && { instagram: form.instagram }),
          ...(form.twitter && { twitter: form.twitter }),
          ...(form.youtube && { youtube: form.youtube }),
        },
      })
      .eq("id", member.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (member.profile_photo_url && member.profile_photo_url !== form.profile_photo_url) {
      await deleteStorageFileFromUrl(supabase, member.profile_photo_url);
    }

    setSaved(true);
    router.push(isElite && form.handle ? `/@${form.handle}` : `/members/${member.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      {saved && (
        <div
          style={{
            background: "#e6f4ea",
            color: "#1e6b3a",
            fontSize: 13.5,
            padding: "10px 12px",
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          Profile updated.
        </div>
      )}

      <div className="field">
        <label>Profile Photo</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
          {form.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.profile_photo_url}
              alt="Profile"
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--mint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--navy)",
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              {(form.full_name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
            id="edit-photo-upload"
          />
          <label
            htmlFor="edit-photo-upload"
            className="btn btn-outline"
            style={{ padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
          >
            {uploading ? "Uploading…" : "Choose Photo"}
          </label>
        </div>
      </div>

      <div className="field">
        <label htmlFor="full_name">Full Name</label>
        <input
          id="full_name"
          value={form.full_name}
          onChange={(e) => update("full_name", e.target.value)}
        />
      </div>

      {isElite && (
        <div className="field">
          <label htmlFor="handle">Handle (yourprofile.com/@handle)</label>
          <input
            id="handle"
            value={form.handle}
            onChange={(e) => update("handle", e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""))}
            placeholder="yourhandle"
          />
        </div>
      )}

      <div className="field">
        <label htmlFor="bio">Bio</label>
        <input
          id="bio"
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="date_of_birth">Date of Birth</label>
        <input
          id="date_of_birth"
          type="date"
          value={form.date_of_birth}
          onChange={(e) => update("date_of_birth", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="gender">Gender</label>
        <input
          id="gender"
          value={form.gender}
          onChange={(e) => update("gender", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="blood_group">Blood Group</label>
        <input
          id="blood_group"
          value={form.blood_group}
          onChange={(e) => update("blood_group", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="why_joining">Why You Joined</label>
        <input
          id="why_joining"
          value={form.why_joining}
          onChange={(e) => update("why_joining", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="vehicle_number">Vehicle Number</label>
        <input
          id="vehicle_number"
          value={form.vehicle_number}
          onChange={(e) => update("vehicle_number", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="address">Address</label>
        <input
          id="address"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="facebook">Facebook</label>
        <input
          id="facebook"
          value={form.facebook}
          onChange={(e) => update("facebook", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="instagram">Instagram</label>
        <input
          id="instagram"
          value={form.instagram}
          onChange={(e) => update("instagram", e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-amber auth-submit" disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
