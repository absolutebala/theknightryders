// Server-only. Sends a plain email via Resend (https://resend.com) to notify
// the admin that someone new is waiting for approval.
//
// If RESEND_API_KEY isn't set, this quietly no-ops (logs to console instead)
// so the approval workflow still works via the /admin page even before
// email is wired up.
export async function notifyAdminOfPendingRequest(params: {
  requesterEmail: string;
  requesterName: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "sribalas@gmail.com";
  const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.log(
      `[notify-admin] RESEND_API_KEY not set -- skipping email. Would have notified ${adminEmail} about ${params.requesterEmail}.`
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: adminEmail,
        subject: "New member access request — The Knight Ryders",
        text: `${params.requesterName ?? "Someone"} (${params.requesterEmail}) just requested access to the members area.\n\nApprove or reject here: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin`,
      }),
    });

    if (!res.ok) {
      console.error("[notify-admin] Resend API error:", await res.text());
    }
  } catch (err) {
    console.error("[notify-admin] Failed to send email:", err);
  }
}
