export type ItineraryMeal = { meal: string; place: string };
export type ItineraryDay = { label: string; meals: ItineraryMeal[] };
export type ParsedItinerary = { intro: string; days: ItineraryDay[] };

const DAY_PATTERN = /(Day\s*\d+)/gi;
const MEAL_PATTERN = /(Breakfast|Lunch|Dinner)\s*[\u2013\u2014-]\s*/gi;

function splitMeals(dayContent: string): ItineraryMeal[] {
  const segments = dayContent.split(MEAL_PATTERN);
  const meals: ItineraryMeal[] = [];
  for (let i = 1; i < segments.length; i += 2) {
    const meal = segments[i]?.trim();
    const place = segments[i + 1]?.trim();
    if (meal && place) meals.push({ meal, place });
  }
  return meals;
}

/**
 * Detects a "Day 1 ... Breakfast - X Lunch - Y Dinner - Z Day 2 ..." style
 * itinerary embedded in a plain-text description and structures it. Returns
 * null if the text doesn't contain a recognizable "Day N" + meal pattern,
 * so callers can fall back to rendering it as normal paragraph text.
 *
 * Note: since the source text has no punctuation marking where one meal's
 * location ends and any trailing extra text begins, anything after the
 * last recognized meal on a day gets folded into that meal's place value
 * as-is -- a minor, honest limitation rather than a fragile guess.
 */
export function parseItinerary(text: string): ParsedItinerary | null {
  const parts = text.split(DAY_PATTERN);
  if (parts.length <= 1) return null; // no "Day N" markers found

  const intro = (parts[0] ?? "").trim();
  const days: ItineraryDay[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    const label = parts[i].trim();
    const content = parts[i + 1] ?? "";
    days.push({ label, meals: splitMeals(content) });
  }

  const totalMeals = days.reduce((sum, d) => sum + d.meals.length, 0);
  if (totalMeals === 0) return null;

  return { intro, days };
}
