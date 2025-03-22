import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface Web3Metrics {
  totalWeb3Mentions: number;
  blockchainMentions: number;
  defiMentions: number;
  nftMentions: number;
  walletMentions: number;
  conceptMentions: number;
  web3Percentage: number;
  mostDiscussedCategory: string;
  categories: {
    blockchain: Record<string, number>;
    defi: Record<string, number>;
    nft: Record<string, number>;
    wallet: Record<string, number>;
    concepts: Record<string, number>;
  };
}

interface Web3Score {
  score: number;
  rating: string;
  metrics: Web3Metrics;
  expertise: string[];
  feedback: string[];
}

interface Web3ScoreCardProps {
  web3Score: Web3Score;
}

export default function Web3ScoreCard({ web3Score }: Web3ScoreCardProps) {
  // Define color based on score
  const getScoreColor = () => {
    if (web3Score.score >= 80) return "bg-green-500";
    if (web3Score.score >= 60) return "bg-yellow-500";
    if (web3Score.score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Find top mentioned blockchain if any
  const topBlockchain = Object.entries(web3Score.metrics.categories.blockchain)
    .sort((a, b) => b[1] - a[1])
    .map(([chain]) => chain)[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Web3 Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium">Web3 Score</span>
            <span className="text-sm font-semibold">{web3Score.score}/100</span>
          </div>
          <Progress
            value={web3Score.score}
            className={`h-2 ${getScoreColor()}`}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-base font-semibold">
            Rating: <span className="text-indigo-600">{web3Score.rating}</span>
          </h3>
        </div>

        {web3Score.expertise.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium">Expertise Areas:</h4>
            <div className="flex flex-wrap gap-2">
              {web3Score.expertise.map((area, index) => (
                <span
                  key={index}
                  className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium">Web3 Insights:</h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
            {web3Score.feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Web3 Content:</span>{" "}
            {web3Score.metrics.web3Percentage.toFixed(1)}%
          </div>
          {web3Score.metrics.mostDiscussedCategory && (
            <div className="rounded-md bg-muted p-2 text-sm">
              <span className="font-medium">Top Category:</span>{" "}
              {web3Score.metrics.mostDiscussedCategory.charAt(0).toUpperCase() +
                web3Score.metrics.mostDiscussedCategory.slice(1)}
            </div>
          )}
          {topBlockchain && (
            <div className="rounded-md bg-muted p-2 text-sm">
              <span className="font-medium">Favorite Chain:</span>{" "}
              {topBlockchain.charAt(0).toUpperCase() + topBlockchain.slice(1)}
            </div>
          )}
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Web3 Topics:</span>{" "}
            {web3Score.metrics.totalWeb3Mentions}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
