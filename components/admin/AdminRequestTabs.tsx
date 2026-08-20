"use client";

import { useState } from "react";
import UniversalRequestActions from "./UniversalRequestActions";

type AccessRequest = {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
};

type TemplateRequest = {
  id: string;
  member_id: string;
  requested_at: string;
  status?: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  memberName: string | null;
  memberHandle: string | null;
};

type ReactivationRequest = {
  id: string;
  full_name: string | null;
  reactivation_requested_at: string;
};

type RideRequest = {
  id: string;
  ride_title: string;
  ride_slug: string;
  member_name: string | null;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
};

const TABS = [
  { key: "access", label: "Access Requests" },
  { key: "elite", label: "Elite Templates" },
  { key: "reactivation", label: "Reactivations" },
  { key: "pastRide", label: "Past Ride Joins" },
  { key: "upcomingRide", label: "Upcoming Ride Joins" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function SubTabs({ active, onChange, counts }: { active: string; onChange: (s: string) => void; counts: Record<string, number> }) {
  const subs = ["pending", "approved", "rejected"];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {subs.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          style={{
            padding: "6px 14px",
            fontSize: 12.5,
            borderRadius: 16,
            border: "1px solid " + (active === s ? "var(--navy)" : "#d8e0dc"),
            background: active === s ? "var(--navy)" : "transparent",
            color: active === s ? "#fff" : "var(--dark)",
            cursor: "pointer",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {s} {counts[s] !== undefined ? `(${counts[s]})` : ""}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p style={{ color: "var(--grey)", fontSize: 13.5 }}>{text}</p>;
}

const rowStyle: React.CSSProperties = {
  background: "var(--mint)",
  borderRadius: 12,
  padding: "14px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 14,
};

function MemberLink({ name, handle, memberId }: { name: string | null; handle: string | null; memberId: string }) {
  return (
    <a
      href={handle ? `/@${handle}` : `/members/${memberId}`}
      target="_blank"
      rel="noopener"
      style={{ fontWeight: 700, color: "var(--navy)", textDecoration: "underline" }}
    >
      {name || "(unnamed member)"}
      {handle && <span style={{ color: "var(--grey)", fontWeight: 500 }}> @{handle}</span>}
    </a>
  );
}

function HistoryRow({
  label,
  status,
  requestedAt,
  reviewedAt,
  reviewedBy,
}: {
  label: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}) {
  return (
    <div style={{ fontSize: 13, color: "var(--grey)", padding: "8px 0", borderBottom: "1px solid #e4e4e4" }}>
      <strong style={{ color: "var(--dark)" }}>{label}</strong> &mdash;{" "}
      <span style={{ color: status === "approved" ? "#1e6b3a" : "#a3312a", fontWeight: 600, textTransform: "capitalize" }}>
        {status}
      </span>{" "}
      {reviewedBy && <>by {reviewedBy}</>}
      <br />
      Requested {new Date(requestedAt).toLocaleString("en-IN")}
      {reviewedAt && <> &middot; Reviewed {new Date(reviewedAt).toLocaleString("en-IN")}</>}
    </div>
  );
}

function RideRequestList({
  items,
  sub,
  approveFn,
  rejectFn,
  paramName = "request_id",
  linkBase,
}: {
  items: RideRequest[];
  sub: string;
  approveFn: string;
  rejectFn: string;
  paramName?: string;
  linkBase: string;
}) {
  if (items.length === 0) return <EmptyState text={`No ${sub} requests.`} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((r) => (
        <div key={r.id} style={rowStyle}>
          <div>
            <span style={{ fontWeight: 700, color: "var(--navy)" }}>{r.member_name ?? "Knight Ryder"}</span>
            <span style={{ color: "var(--grey)" }}> &rarr; </span>
            <a href={`${linkBase}/${r.ride_slug}`} style={{ color: "var(--cta-blue)" }}>
              {r.ride_title}
            </a>
            <div style={{ fontSize: 11.5, color: "var(--grey)", marginTop: 2 }}>
              Requested {new Date(r.requested_at).toLocaleString("en-IN")}
            </div>
          </div>
          <UniversalRequestActions
            id={r.id}
            status={r.status}
            approveFn={approveFn}
            rejectFn={sub === "pending" ? rejectFn : undefined}
            paramName={paramName}
          />
        </div>
      ))}
    </div>
  );
}

export default function AdminRequestTabs({
  accessPending,
  accessReviewed,
  templatePending,
  templateReviewed,
  reactivationPending,
  pastRideRequests,
  upcomingRideRequests,
}: {
  accessPending: AccessRequest[];
  accessReviewed: AccessRequest[];
  templatePending: TemplateRequest[];
  templateReviewed: TemplateRequest[];
  reactivationPending: ReactivationRequest[];
  pastRideRequests: RideRequest[];
  upcomingRideRequests: RideRequest[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("access");
  const [accessSub, setAccessSub] = useState("pending");
  const [eliteSub, setEliteSub] = useState("pending");
  const [pastRideSub, setPastRideSub] = useState("pending");
  const [upcomingRideSub, setUpcomingRideSub] = useState("pending");

  const accessApproved = accessReviewed.filter((r) => r.status === "approved");
  const accessRejected = accessReviewed.filter((r) => r.status === "rejected");
  const eliteApproved = templateReviewed.filter((r) => r.status === "approved");
  const eliteRejected = templateReviewed.filter((r) => r.status === "rejected");
  const pastRidePending = pastRideRequests.filter((r) => r.status === "pending");
  const pastRideApproved = pastRideRequests.filter((r) => r.status === "approved");
  const pastRideRejected = pastRideRequests.filter((r) => r.status === "rejected");
  const upcomingRidePending = upcomingRideRequests.filter((r) => r.status === "pending");
  const upcomingRideApproved = upcomingRideRequests.filter((r) => r.status === "approved");
  const upcomingRideRejected = upcomingRideRequests.filter((r) => r.status === "rejected");

  const tabCounts: Record<TabKey, number> = {
    access: accessPending.length,
    elite: templatePending.length,
    reactivation: reactivationPending.length,
    pastRide: pastRidePending.length,
    upcomingRide: upcomingRidePending.length,
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 30, borderBottom: "1px solid #e3ebe7", paddingBottom: 14 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "9px 16px",
              fontSize: 13,
              borderRadius: 8,
              border: "none",
              background: activeTab === t.key ? "var(--mint)" : "transparent",
              color: activeTab === t.key ? "var(--navy)" : "var(--grey)",
              fontWeight: activeTab === t.key ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {t.label}
            {tabCounts[t.key] > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "#a3312a",
                  color: "#fff",
                  borderRadius: 10,
                  fontSize: 10.5,
                  padding: "1px 6px",
                  fontWeight: 700,
                }}
              >
                {tabCounts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "access" && (
        <div>
          <SubTabs
            active={accessSub}
            onChange={setAccessSub}
            counts={{ pending: accessPending.length, approved: accessApproved.length, rejected: accessRejected.length }}
          />
          {accessSub === "pending" &&
            (accessPending.length === 0 ? (
              <EmptyState text="Nothing pending." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {accessPending.map((req) => (
                  <div key={req.id} style={rowStyle}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)" }}>{req.full_name || "(no name provided)"}</div>
                      <div style={{ fontSize: 13, color: "var(--grey)" }}>{req.email}</div>
                      <div style={{ fontSize: 11.5, color: "var(--grey)", marginTop: 2 }}>
                        Requested {new Date(req.requested_at).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <UniversalRequestActions id={req.id} status="pending" approveFn="approve_pending_request" rejectFn="reject_pending_request" />
                  </div>
                ))}
              </div>
            ))}
          {accessSub === "approved" &&
            (accessApproved.length === 0 ? (
              <EmptyState text="No approved requests yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {accessApproved.map((req) => (
                  <HistoryRow key={req.id} label={req.email} status="approved" requestedAt={req.requested_at} reviewedAt={req.reviewed_at} reviewedBy={req.reviewed_by} />
                ))}
              </div>
            ))}
          {accessSub === "rejected" &&
            (accessRejected.length === 0 ? (
              <EmptyState text="No rejected requests." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {accessRejected.map((req) => (
                  <div key={req.id} style={rowStyle}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)" }}>{req.full_name || "(no name provided)"}</div>
                      <div style={{ fontSize: 13, color: "var(--grey)" }}>{req.email}</div>
                    </div>
                    <UniversalRequestActions id={req.id} status="rejected" approveFn="approve_pending_request" />
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      {activeTab === "elite" && (
        <div>
          <SubTabs
            active={eliteSub}
            onChange={setEliteSub}
            counts={{ pending: templatePending.length, approved: eliteApproved.length, rejected: eliteRejected.length }}
          />
          {eliteSub === "pending" &&
            (templatePending.length === 0 ? (
              <EmptyState text="Nothing pending." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {templatePending.map((req) => (
                  <div key={req.id} style={rowStyle}>
                    <MemberLink name={req.memberName} handle={req.memberHandle} memberId={req.member_id} />
                    <UniversalRequestActions id={req.id} status="pending" approveFn="approve_template_request" rejectFn="reject_template_request" />
                  </div>
                ))}
              </div>
            ))}
          {eliteSub === "approved" &&
            (eliteApproved.length === 0 ? (
              <EmptyState text="No approved requests yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {eliteApproved.map((req) => (
                  <HistoryRow key={req.id} label={req.memberName ?? "Unnamed"} status="approved" requestedAt={req.requested_at} reviewedAt={req.reviewed_at} reviewedBy={req.reviewed_by} />
                ))}
              </div>
            ))}
          {eliteSub === "rejected" &&
            (eliteRejected.length === 0 ? (
              <EmptyState text="No rejected requests." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {eliteRejected.map((req) => (
                  <div key={req.id} style={rowStyle}>
                    <MemberLink name={req.memberName} handle={req.memberHandle} memberId={req.member_id} />
                    <UniversalRequestActions id={req.id} status="rejected" approveFn="approve_template_request" />
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      {activeTab === "reactivation" && (
        <div>
          <p style={{ fontSize: 12.5, color: "var(--grey)", marginBottom: 16 }}>
            Members who removed their own profile and are asking to come back. (Reviewed history isn&apos;t tracked for this category, so this shows pending requests only.)
          </p>
          {reactivationPending.length === 0 ? (
            <EmptyState text="Nothing pending." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reactivationPending.map((m) => (
                <div key={m.id} style={rowStyle}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--navy)" }}>{m.full_name ?? "Knight Ryder"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--grey)", marginTop: 2 }}>
                      Requested {new Date(m.reactivation_requested_at).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <UniversalRequestActions
                    id={m.id}
                    status="pending"
                    approveFn="approve_reactivation"
                    rejectFn="reject_reactivation_request"
                    paramName="target_member_id"
                    confirmApprove="Restore this member's profile? They'll show up again in the Members directory, leaderboard, and Frequently Rides With."
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "pastRide" && (
        <div>
          <SubTabs
            active={pastRideSub}
            onChange={setPastRideSub}
            counts={{ pending: pastRidePending.length, approved: pastRideApproved.length, rejected: pastRideRejected.length }}
          />
          <RideRequestList
            items={pastRideSub === "pending" ? pastRidePending : pastRideSub === "approved" ? pastRideApproved : pastRideRejected}
            sub={pastRideSub}
            approveFn="approve_ride_join_request"
            rejectFn="reject_ride_join_request"
            linkBase="/rides"
          />
        </div>
      )}

      {activeTab === "upcomingRide" && (
        <div>
          <SubTabs
            active={upcomingRideSub}
            onChange={setUpcomingRideSub}
            counts={{ pending: upcomingRidePending.length, approved: upcomingRideApproved.length, rejected: upcomingRideRejected.length }}
          />
          <RideRequestList
            items={upcomingRideSub === "pending" ? upcomingRidePending : upcomingRideSub === "approved" ? upcomingRideApproved : upcomingRideRejected}
            sub={upcomingRideSub}
            approveFn="approve_upcoming_ride_participant"
            rejectFn="reject_upcoming_ride_participant"
            paramName="participant_id"
            linkBase="/rides/upcoming"
          />
        </div>
      )}
    </div>
  );
}
