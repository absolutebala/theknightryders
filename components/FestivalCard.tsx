"use client";

import HomepagePremiumCard from "./HomepagePremiumCard";
import { type PremiumCardOptions } from "@/lib/canvasCardDownload";

type FestivalCard = {
  holiday_key: string;
  holiday_name: string;
  image_url: string;
  holiday_date: string;
  wish_text: string | null;
};

export default function FestivalCard({ card }: { card: FestivalCard }) {
  const wish = card.wish_text || `Happy ${card.holiday_name}!`;
  const pillText = new Date(card.holiday_date)
    .toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    .toUpperCase();

  const options: PremiumCardOptions = {
    subtitle: "Celebrating",
    title: card.holiday_name,
    pillText,
    imageUrl: card.image_url,
    creditRow: null,
    bottomPills: null,
    bottomMessage: wish,
    filenameBase: card.holiday_name,
  };

  return <HomepagePremiumCard options={options} width={320} />;
}
