"use client";

interface Badge {
  emoji: string;
  label: string;
  earned: boolean;
  description: string;
}

interface MilestoneBadgesProps {
  listing: {
    views_count: number;
    inquiries_count: number;
    featured?: boolean;
  };
  completionScore: number;
}

export default function MilestoneBadges({ listing, completionScore }: MilestoneBadgesProps) {
  const badges: Badge[] = [
    {
      emoji:       "🏆",
      label:       "Erstes Inserat",
      earned:      true,
      description: "Herzlichen Glückwunsch zum ersten Inserat!",
    },
    {
      emoji:       "👁️",
      label:       "100 Aufrufe",
      earned:      listing.views_count >= 100,
      description: listing.views_count >= 100
        ? "Sie haben 100 Aufrufe erreicht!"
        : `${listing.views_count} von 100 Aufrufen`,
    },
    {
      emoji:       "💬",
      label:       "Erste Anfrage",
      earned:      listing.inquiries_count >= 1,
      description: listing.inquiries_count >= 1
        ? "Sie haben Ihre erste Käuferanfrage erhalten!"
        : "Noch keine Anfragen",
    },
    {
      emoji:       "⭐",
      label:       "Vollständig",
      earned:      completionScore >= 100,
      description: completionScore >= 100
        ? "Ihr Inserat ist vollständig ausgefüllt"
        : `${completionScore}% vollständig`,
    },
    {
      emoji:       "🚀",
      label:       "Featured",
      earned:      !!listing.featured,
      description: listing.featured
        ? "Ihr Inserat ist als Featured markiert"
        : "Upgrade auf Premium für Featured-Status",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {badges.map((badge) => (
        <div
          key={badge.label}
          title={badge.description}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-default"
          style={{
            border:     `1px solid ${badge.earned ? "#2d5a3d" : "#e5e5e5"}`,
            background: badge.earned ? "#e8f5ed" : "#fafafa",
            opacity:    badge.earned ? 1 : 0.5,
          }}
        >
          <span className="text-sm">{badge.emoji}</span>
          <span
            className="font-sans text-[11px] font-semibold"
            style={{ color: badge.earned ? "#2d5a3d" : "#aaa" }}
          >
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  );
}
