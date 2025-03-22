import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface Metrics {
  totalCasts: number;
  totalLikes: number;
  totalReplies: number;
  totalCharacters: number;
  avgLikesPerCast: number;
  engagementRate: number;
  consistencyScore: number;
}

interface ScoreData {
  score: number;
  metrics: Metrics;
  rating: string;
  feedback: string[];
  web3Score?: any;
}

interface ScoreCardProps {
  scoreData: ScoreData;
}

export default function ScoreCard({ scoreData }: ScoreCardProps) {
  // Define color based on score
  const getScoreColor = () => {
    if (scoreData.score >= 80) return "bg-green-500";
    if (scoreData.score >= 60) return "bg-yellow-500";
    if (scoreData.score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Farcaster Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium">Your Score</span>
            <span className="text-sm font-semibold">{scoreData.score}/100</span>
          </div>
          <Progress
            value={scoreData.score}
            className={`h-2 ${getScoreColor()}`}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-base font-semibold">
            Rating: <span className="text-primary">{scoreData.rating}</span>
          </h3>
        </div>

        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium">Feedback:</h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
            {scoreData.feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Total Casts:</span>{" "}
            {scoreData.metrics.totalCasts}
          </div>
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Total Likes:</span>{" "}
            {scoreData.metrics.totalLikes}
          </div>
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Avg. Likes/Cast:</span>{" "}
            {scoreData.metrics.avgLikesPerCast.toFixed(1)}
          </div>
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Engagement Rate:</span>{" "}
            {scoreData.metrics.engagementRate.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
