"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NeynarAuthButton, useNeynarContext } from "@neynar/react";
import { useAccount } from "wagmi";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Loader2 } from "lucide-react";
import CastList from "../components/cast-list";

// API Cast type from Neynar
interface ApiCast {
  object: string;
  hash: string;
  author: any;
  text: string;
  timestamp: string;
  reactions: any;
  replies: any;
}

// UI Cast type matching the one in cast-list.tsx
interface Cast {
  hash: string;
  text: string;
  timestamp: string;
  mentions: string[];
  likeCount: number;
  replyCount: number;
  recastCount: number;
}

interface Metrics {
  totalCasts: number;
  totalLikes: number;
  totalReplies: number;
  totalCharacters: number;
  avgLikesPerCast: number;
  engagementRate: number;
  consistencyScore: number;
}

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

interface ScoreData {
  score: number;
  metrics: Metrics;
  rating: string;
  feedback: string[];
  web3Score: Web3Score;
}

interface ScoreResponse {
  casts: ApiCast[];
  score: ScoreData;
}

// Convert API cast to UI cast
function adaptCastsForUI(apiCasts: ApiCast[]): Cast[] {
  return apiCasts.map((cast) => ({
    hash: cast.hash,
    text: cast.text,
    timestamp: cast.timestamp,
    mentions: cast.author?.username ? [cast.author.username] : [],
    likeCount: cast.reactions?.likes_count || 0,
    replyCount: cast.replies?.count || 0,
    recastCount: cast.reactions?.recasts_count || 0,
  }));
}

// Assuming these components exist in your project
const OnboardingGuide = ({
  user,
  hasWallet,
  hasCasted,
  onConnectWallet,
}: any) => (
  <Card className="overflow-hidden border-none bg-gradient-to-br from-violet-50 to-purple-50 shadow-md transition-all hover:shadow-lg">
    <CardContent className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Get Started</h3>
      <ul className="space-y-3">
        <li className="flex items-center gap-3">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              hasWallet ? "bg-green-500" : "bg-gray-200"
            }`}
          >
            {hasWallet && <span className="text-xs text-white">✓</span>}
          </div>
          <span className={hasWallet ? "text-gray-700" : "font-medium"}>
            Connect wallet
          </span>
        </li>
        <li className="flex items-center gap-3">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              hasCasted ? "bg-green-500" : "bg-gray-200"
            }`}
          >
            {hasCasted && <span className="text-xs text-white">✓</span>}
          </div>
          <span className={hasCasted ? "text-gray-700" : "font-medium"}>
            Create your first cast
          </span>
        </li>
      </ul>
      {!hasWallet && (
        <Button
          onClick={onConnectWallet}
          variant="outline"
          className="mt-4 w-full rounded-full border-violet-200 bg-white/50 font-medium text-violet-700 backdrop-blur-sm hover:bg-violet-100"
        >
          Connect Wallet
        </Button>
      )}
    </CardContent>
  </Card>
);

const ScoreCard = ({ scoreData }: { scoreData: any }) => (
  <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md transition-all hover:shadow-lg">
    <CardContent className="p-6">
      <h3 className="mb-3 text-lg font-semibold">Your Score</h3>
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold text-blue-600">
          {scoreData.score || 0}
        </div>
        <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Level {Math.floor((scoreData.score || 0) / 100) + 1}
        </div>
      </div>
    </CardContent>
  </Card>
);

const Web3ScoreCard = ({ web3Score }: { web3Score: any }) => (
  <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md transition-all hover:shadow-lg">
    <CardContent className="p-6">
      <h3 className="mb-3 text-lg font-semibold">Web3 Activity</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-sm text-gray-500">NFTs</div>
          <div className="text-xl font-semibold">
            {web3Score.metrics?.nftMentions || 0}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-sm text-gray-500">Transactions</div>
          <div className="text-xl font-semibold">
            {web3Score.metrics?.totalWeb3Mentions || 0}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Home() {
  const { user } = useNeynarContext();
  const { address, isConnected } = useAccount();
  const [text, setText] = useState("");
  const [userCasts, setUserCasts] = useState<Cast[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userDbData, setUserDbData] = useState<any>(null);
  const [walletLinked, setWalletLinked] = useState(false);

  // Check if user has submitted any casts
  const hasCasted = userCasts.length > 0;

  const handleConnectWallet = async () => {
    if (!user?.fid || !address) return;

    try {
      setLoading(true);
      // Update user with wallet address
      const response = await axios.put("/api/user", {
        fid: user.fid,
        walletAddress: address,
      });

      if (response.data.success) {
        setUserDbData(response.data.data);
        setWalletLinked(true);
        alert("Wallet connected successfully!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishCast = async () => {
    try {
      setLoading(true);
      await axios.post("/api/cast", {
        signerUuid: user?.signer_uuid,
        text,
      });
      alert("Cast Published!");

      setText("");
      fetchScore(); // Refresh casts after publishing
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to publish cast";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchScore = async () => {
    if (user) {
      try {
        setLoading(true);
        // Fetch user first
        try {
          const userResponse = await axios.get(`/api/user?fid=${user.fid}`);
          if (userResponse.data.success) {
            setUserDbData(userResponse.data.data);
            setWalletLinked(!!userResponse.data.data.walletAddress);
          }
        } catch (userError) {
          // User doesn't exist yet, will be created in getScore
          console.log("User not found in database, will create new record");
        }

        // Now get score data
        const response = await axios.post<{
          message: string;
          data: ScoreResponse;
        }>("/api/getScore", {
          fid: user?.fid,
          username: user?.username,
          displayName: user?.display_name,
          pfpUrl: user?.pfp_url,
          signerUuid: user?.signer_uuid,
        });

        if (response.data.data) {
          const { casts, score } = response.data.data;
          setUserCasts(adaptCastsForUI(casts || []));
          setScoreData(score || null);
        }
      } catch (error) {
        console.error("Error fetching casts:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchScore();

    // Check if wallet is connected
    if (isConnected && address && userDbData?.walletAddress === address) {
      setWalletLinked(true);
    }
  }, [user, isConnected, address, userDbData?.walletAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="sticky top-0 z-10 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
            locol
          </h1>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center">
          <NeynarAuthButton
            label="Login with Farcaster"
            customLogoUrl="
          https://framerusercontent.com/images/DE2CvWySqIW7eDC8Ehs5bCK6g.svg"
          />
        </div>

        {loading && !user && (
          <div className="my-12 flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          </div>
        )}

        {user && (
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1fr_2fr]">
            <div className="space-y-6">
              <Card className="overflow-hidden border-none bg-white shadow-md transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-violet-200 ring-offset-2">
                      <AvatarImage src={user.pfp_url} alt={user.display_name} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        {user.display_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold">{user.display_name}</h2>
                      <p className="text-sm text-violet-600">
                        @{user.username}
                      </p>
                      {walletLinked && address && (
                        <p className="mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {`${address.substring(0, 6)}...${address.substring(
                            address.length - 4
                          )}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <OnboardingGuide
                user={userDbData}
                hasWallet={walletLinked}
                hasCasted={hasCasted}
                onConnectWallet={handleConnectWallet}
              />

              <Card className="overflow-hidden border-none bg-white shadow-md transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">Create a Cast</h3>
                  <Textarea
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setText(e.target.value)
                    }
                    placeholder="What's on your mind?"
                    className="mb-4 min-h-[120px] resize-none rounded-xl border-gray-200 bg-gray-50 focus:border-violet-300 focus:ring-violet-300"
                  />
                  <Button
                    onClick={handlePublishCast}
                    disabled={loading || !text.trim()}
                    className="w-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600 font-medium shadow-md transition-all hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Cast"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {scoreData && (
                <>
                  <ScoreCard scoreData={scoreData} />
                  {scoreData.web3Score && (
                    <Web3ScoreCard web3Score={scoreData.web3Score} />
                  )}
                </>
              )}

              {userCasts.length > 0 && <CastList casts={userCasts} />}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-center">
        <p className="text-sm font-medium text-gray-500">
          Made with <span className="text-red-500">❤️</span> by{" "}
          <span className="text-violet-500">
            <a
              href="https://x.com/corotvoid"
              target="_blank"
              className="underline "
              rel="noopener noreferrer"
            >
              corotvoid.eth
            </a>
          </span>
        </p>
      </footer>
    </div>
  );
}
