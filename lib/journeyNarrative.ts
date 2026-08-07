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
  rides: Ride[]; // sorted most-recent-first
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

// Strips a leading "Ride #83 :" / "Ride #83:" style prefix, leaving just
// the destination/description part of the title.
/**
 * Parses a "Ride #96" style number out of a title and formats it as an
 * ordinal label, e.g. "96th Ride". Returns null if the title doesn't
 * contain a recognizable ride number.
 */
export function getOrdinalRideLabel(title: string): string | null {
  const match = title.match(/ride\s*#\s*(\d+)/i);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  return `${n}${suffix} Ride`;
}

export function cleanRideTitle(title: string): string {
  return title.replace(/^ride\s*#\s*\d+\s*[:\-]\s*/i, "").trim() || title;
}

const TERRAIN_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bhills?\b/i, label: "hills" },
  { pattern: /\bghats?\b/i, label: "ghats" },
  { pattern: /\bcoast(al)?\b/i, label: "coastal roads" },
  { pattern: /\bbeach(es)?\b/i, label: "beaches" },
  { pattern: /\bforest(s)?\b/i, label: "forests" },
  { pattern: /\bvalley(s)?\b/i, label: "valleys" },
  { pattern: /\bwaterfalls?\b/i, label: "waterfalls" },
  { pattern: /\bdams?\b/i, label: "dams" },
  { pattern: /\blakes?\b/i, label: "lakes" },
  { pattern: /\bbackwaters?\b/i, label: "backwaters" },
  { pattern: /\bdeserts?\b/i, label: "desert stretches" },
  { pattern: /\bmountains?\b/i, label: "mountains" },
  { pattern: /\bforts?\b/i, label: "forts" },
  { pattern: /\btemples?\b/i, label: "temples" },
  { pattern: /\bislands?\b/i, label: "islands" },
];

export function findTerrainMentions(rides: Ride[]): string[] {
  const found = new Set<string>();
  for (const ride of rides) {
    for (const { pattern, label } of TERRAIN_PATTERNS) {
      if (pattern.test(ride.title)) {
        found.add(label);
      }
    }
  }
  return Array.from(found);
}

export function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function generateJourneyNarrative({
  memberId,
  fullName,
  totalKm,
  ridesCount,
  joinYear,
  rides,
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

  const paragraphs: string[] = [pick(openings, seed, 0)];

  // --- Highlight a handful of distinctive rides (earliest, a couple in the
  // middle, and the most recent) rather than just one. ---
  const sortedOldestFirst = [...rides].reverse();
  const highlightCandidates: Ride[] = [];
  if (sortedOldestFirst.length > 0) highlightCandidates.push(sortedOldestFirst[0]); // earliest
  if (rides.length > 1) {
    const midIndex = Math.floor(rides.length / 2);
    if (rides[midIndex] && rides[midIndex] !== highlightCandidates[0]) {
      highlightCandidates.push(rides[midIndex]);
    }
  }
  if (rides.length > 2 && rides[0] !== highlightCandidates[0] && rides[0] !== highlightCandidates[1]) {
    highlightCandidates.push(rides[0]); // most recent
  } else if (highlightCandidates.length < 2 && rides[0]) {
    highlightCandidates.push(rides[0]);
  }

  const highlightNames = highlightCandidates
    .map((r) => cleanRideTitle(r.title))
    .filter((name, i, arr) => arr.indexOf(name) === i); // de-dupe

  if (highlightNames.length >= 2) {
    const highlightTemplates = [
      `The road has taken ${firstName} everywhere from ${formatList(highlightNames)} -- each ride adding a new destination to the list.`,
      `Highlights along the way include ${formatList(highlightNames)}, a spread of rides that says as much about the destinations as the distance covered.`,
      `From ${highlightNames[0]} early on to ${highlightNames[highlightNames.length - 1]} more recently, ${firstName}'s rides read like a travelogue of their own.`,
    ];
    paragraphs.push(pick(highlightTemplates, seed, 2));
  } else if (highlightNames.length === 1) {
    paragraphs.push(
      `One ride stands out in particular -- ${highlightNames[0]}, a trip ${firstName} won't easily forget.`
    );
  }

  // --- Terrain variety, if we can infer it from ride titles. ---
  const terrain = findTerrainMentions(rides);
  if (terrain.length > 0) {
    const terrainPhrase = formatList(terrain.slice(0, 3));
    const terrainTemplates = [
      `The routes haven't stuck to one kind of road either -- ${terrainPhrase} have all featured along the way, each demanding a different kind of riding.`,
      `Variety has been part of the appeal: rides through ${terrainPhrase} mean no two outings have felt quite the same.`,
    ];
    paragraphs.push(pick(terrainTemplates, seed, 3));
  } else if (ridesCount >= 3) {
    paragraphs.push(
      `Every ride has brought its own mix of roads and terrain -- part of what keeps the miles from ever feeling routine.`
    );
  }

  // --- Co-rider mention. ---
  if (topCoRider?.full_name && topCoRider.shared_rides > 1) {
    paragraphs.push(
      `Along the way, ${topCoRider.full_name} has been a familiar face on ${topCoRider.shared_rides} of those rides -- some journeys are always better shared.`
    );
  }

  const closings = [
    "Here's to many more miles ahead.",
    "The road ahead promises even more adventures.",
    "And the journey is far from over.",
  ];
  paragraphs.push(pick(closings, seed, 1));

  return paragraphs.join(" ");
}
