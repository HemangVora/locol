import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@neynar/react/dist/style.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { NeynarContextProvider, Theme } from "@neynar/react";

import { config } from "../wagmi";

const client = new QueryClient();

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider>
            <NeynarContextProvider
              settings={{
                clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
                defaultTheme: Theme.Light,
                eventsCallbacks: {
                  onAuthSuccess: () => {},
                  onSignout() {},
                },
              }}
            >
              <Component {...pageProps} />
            </NeynarContextProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}

export default MyApp;
