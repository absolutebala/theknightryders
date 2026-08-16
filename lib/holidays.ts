// Major Indian holidays for 2026, sourced from the Central Government's
// gazetted + restricted holiday list. Fixed-date holidays (Republic Day,
// Independence Day, Gandhi Jayanti, Christmas, New Year's) stay the same
// every year; the rest (Diwali, Holi, Eid, etc.) follow lunar/regional
// calendars and shift each year -- this file needs a manual date refresh
// annually. The admin-uploaded image for each `key` persists across years
// automatically, since images are stored by key, not by date.

export type Holiday = {
  key: string;
  name: string;
  date: string; // ISO yyyy-mm-dd, for the CURRENT year only
};

export const HOLIDAYS_2026: Holiday[] = [
  { key: "new-year", name: "New Year's Day", date: "2026-01-01" },
  { key: "pongal", name: "Pongal", date: "2026-01-14" },
  { key: "republic-day", name: "Republic Day", date: "2026-01-26" },
  { key: "holi", name: "Holi", date: "2026-03-04" },
  { key: "eid-ul-fitr", name: "Eid-ul-Fitr", date: "2026-03-21" },
  { key: "ram-navami", name: "Ram Navami", date: "2026-03-26" },
  { key: "mahavir-jayanti", name: "Mahavir Jayanti", date: "2026-03-31" },
  { key: "good-friday", name: "Good Friday", date: "2026-04-03" },
  { key: "buddha-purnima", name: "Buddha Purnima", date: "2026-05-01" },
  { key: "bakrid", name: "Bakrid (Id-ul-Zuha)", date: "2026-05-27" },
  { key: "muharram", name: "Muharram", date: "2026-06-26" },
  { key: "independence-day", name: "Independence Day", date: "2026-08-15" },
  { key: "onam", name: "Onam", date: "2026-08-26" },
  { key: "raksha-bandhan", name: "Raksha Bandhan", date: "2026-08-28" },
  { key: "janmashtami", name: "Janmashtami", date: "2026-09-04" },
  { key: "ganesh-chaturthi", name: "Ganesh Chaturthi", date: "2026-09-14" },
  { key: "gandhi-jayanti", name: "Gandhi Jayanti", date: "2026-10-02" },
  { key: "dussehra", name: "Dussehra", date: "2026-10-20" },
  { key: "diwali", name: "Diwali", date: "2026-11-08" },
  { key: "guru-nanak-jayanti", name: "Guru Nanak Jayanti", date: "2026-11-24" },
  { key: "christmas", name: "Christmas", date: "2026-12-25" },
];

/** Returns today's holiday (IST-agnostic, server date), or null if none. */
export function getTodaysHoliday(): Holiday | null {
  const today = new Date().toISOString().slice(0, 10);
  return HOLIDAYS_2026.find((h) => h.date === today) ?? null;
}
