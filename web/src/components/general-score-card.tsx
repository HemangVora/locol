import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface GeneralMetrics {
  totalCasts: number;
  totalLikes: number;
  totalReplies: number;
  totalRecasts: number;
  avgLikesPerCast: number;
  avgRepliesPerCast: number;
  avgRecastsPerCast: number;
  engagementRate: number;
  activityLevel: string;
}

interface GeneralScore {
  score: number;
  metrics: GeneralMetrics;
  rating: string;
  feedback: string[];
}

interface GeneralScoreCardProps {
  generalScore: GeneralScore;
}

export default function GeneralScoreCard({
  generalScore,
}: GeneralScoreCardProps) {
  // Define color based on score
  const getScoreColor = () => {
    if (generalScore.score >= 80) return "bg-green-500";
    if (generalScore.score >= 60) return "bg-yellow-500";
    if (generalScore.score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Engagement Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium">Engagement Score</span>
            <span className="text-sm font-semibold">
              {generalScore.score}/100
            </span>
          </div>
          <Progress
            value={generalScore.score}
            className={`h-2 ${getScoreColor()}`}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-base font-semibold">
            Rating:{" "}
            <span className="text-indigo-600">{generalScore.rating}</span>
          </h3>
        </div>

        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium">Engagement Insights:</h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
            {generalScore.feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Total Casts:</span>{" "}
            {generalScore.metrics.totalCasts}
          </div>
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Avg. Likes:</span>{" "}
            {generalScore.metrics.avgLikesPerCast.toFixed(1)}
          </div>
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Engagement:</span>{" "}
            {(generalScore.metrics.engagementRate * 100).toFixed(1)}%
          </div>
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Activity:</span>{" "}
            {generalScore.metrics.activityLevel}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
