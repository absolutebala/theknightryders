type Ride = {
  title: string;
  ride_date: string | null;
};

type CoRider = {
  full_name: string | null;
  shared_rides: number;
};

type JourneyInput = {
  memberId: string;
  fullName: string | null;
  totalKm: number;
  ridesCount: number;
  joinYear: number | null;
  mostRecentRide: Ride | null;
  topCoRider: CoRider | null;
};

// Simple deterministic hash so the same member always gets the same
// phrasing (not re-randomized on every page load), but different members
// get some variety.
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(options: T[], seed: number, salt: number): T {
  return options[(seed + salt) % options.length];
}

export function generateJourneyNarrative({
  memberId,
  fullName,
  totalKm,
  ridesCount,
  joinYear,
  mostRecentRide,
  topCoRider,
}: JourneyInput): string {
  const firstName = (fullName ?? "This rider").split(" ")[0];
  const seed = hashString(memberId);

  if (ridesCount === 0) {
    return `${firstName}'s journey with The Knight Ryders is just getting started${
      joinYear ? ` -- a member since ${joinYear}` : ""
    }. The open road is waiting, and the first ride is always the beginning of something special.`;
  }

  const openings = [
    `Since joining The Knight Ryders${joinYear ? ` in ${joinYear}` : ""}, ${firstName} has clocked ${totalKm.toLocaleString(
      "en-IN"
    )} kilometers across ${ridesCount} ride${ridesCount === 1 ? "" : "s"} -- a testament to a genuine love for the open road.`,
    `${firstName}'s ride log tells a story of dedication: ${ridesCount} ride${ridesCount === 1 ? "" : "s"} and ${totalKm.toLocaleString(
      "en-IN"
    )} kilometers${joinYear ? ` since ${joinYear}` : ""}, each one adding another chapter to the journey.`,
    `From the first ride${joinYear ? ` in ${joinYear}` : ""} to now, ${firstName} has covered ${totalKm.toLocaleString(
      "en-IN"
    )} kilometers over ${ridesCount} ride${ridesCount === 1 ? "" : "s"} with The Knight Ryders -- proof that the road always calls back.`,
  ];

  const sentences = [pick(openings, seed, 0)];

  if (topCoRider?.full_name && topCoRider.shared_rides > 1) {
    sentences.push(
      `Along the way, ${topCoRider.full_name} has been a familiar face on ${topCoRider.shared_rides} of those rides -- some journeys are always better shared.`
    );
  }

  if (mostRecentRide) {
    const dateStr = mostRecentRide.ride_date
      ? new Date(mostRecentRide.ride_date).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })
      : null;
    sentences.push(
      `Most recently, ${firstName} rode ${mostRecentRide.title}${
        dateStr ? ` in ${dateStr}` : ""
      }, adding yet another destination to an ever-growing list.`
    );
  }

  const closings = [
    "Here's to many more miles ahead.",
    "The road ahead promises even more adventures.",
    "And the journey is far from over.",
  ];
  sentences.push(pick(closings, seed, 1));

  return sentences.join(" ");
}
