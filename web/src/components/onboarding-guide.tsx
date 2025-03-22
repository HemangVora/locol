"use client";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

const ONBOARDING_STEPS = {
  CONNECT_FARCASTER: "Connect Farcaster",
  CONNECT_WALLET: "Connect Wallet",
  CREATE_CAST: "Create a Cast",
  EXPLORE_PROFILE: "Explore Your Profile",
};

interface OnboardingGuideProps {
  user: any;
  hasWallet: boolean;
  hasCasted: boolean;
  onConnectWallet: () => void;
}

export default function OnboardingGuide({
  user,
  hasWallet,
  hasCasted,
  onConnectWallet,
}: OnboardingGuideProps) {
  const steps = [
    {
      id: "farcaster",
      title: ONBOARDING_STEPS.CONNECT_FARCASTER,
      completed: !!user,
      description: "Connect your Farcaster account to get started.",
    },
    {
      id: "wallet",
      title: ONBOARDING_STEPS.CONNECT_WALLET,
      completed: hasWallet,
      description: "Link your wallet to save your Web3 identity.",
    },
    {
      id: "cast",
      title: ONBOARDING_STEPS.CREATE_CAST,
      completed: hasCasted,
      description: "Create your first post to begin building your Web3 score.",
    },
    {
      id: "explore",
      title: ONBOARDING_STEPS.EXPLORE_PROFILE,
      completed: user?.web3Score?.score > 0,
      description: "Explore your Web3 profile and identity score.",
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Get Started</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`rounded-md border p-3 transition-colors ${
                step.completed
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                  : " bg-muted/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      step.completed
                        ? "text-green-700 dark:text-green-400"
                        : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>

                  {step.id === "wallet" && !step.completed && (
                    <Button
                      onClick={onConnectWallet}
                      size="sm"
                      className="mt-2"
                      variant="secondary"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
