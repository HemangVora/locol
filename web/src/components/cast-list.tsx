import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Cast {
  hash: string;
  text: string;
  timestamp: string;
  mentions: string[];
  likeCount: number;
  replyCount: number;
  recastCount: number;
}

interface CastListProps {
  casts: Cast[];
}

export default function CastList({ casts }: CastListProps) {
  const [expandedCasts, setExpandedCasts] = useState<Record<string, boolean>>(
    {}
  );

  const toggleCastExpansion = (hash: string) => {
    setExpandedCasts((prev) => ({
      ...prev,
      [hash]: !prev[hash],
    }));
  };

  if (!casts || casts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Casts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent casts found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Casts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {casts.map((cast) => {
          const isExpanded = expandedCasts[cast.hash] || false;
          const castDate = new Date(cast.timestamp);
          const formattedDate = castDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });

          // Truncate text if longer than 150 characters and not expanded
          const displayText =
            !isExpanded && cast.text.length > 150
              ? cast.text.substring(0, 150) + "..."
              : cast.text;

          return (
            <div
              key={cast.hash}
              className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span>❤️ {cast.likeCount}</span>
                  <span>💬 {cast.replyCount}</span>
                  <span>🔄 {cast.recastCount}</span>
                </div>
              </div>
              <p className="mb-1 text-sm">{displayText}</p>
              {cast.text.length > 150 && (
                <button
                  onClick={() => toggleCastExpansion(cast.hash)}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
              {cast.mentions.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {cast.mentions.map((mention, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800"
                    >
                      @{mention}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
