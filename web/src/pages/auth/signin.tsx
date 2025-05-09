import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { getProviders, signIn } from "next-auth/react";
import { authOptions } from "../api/auth/[...nextauth]";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { FaDiscord } from "react-icons/fa";

export default function SignIn({ providers }: { providers: any }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center ">
      <div className="container mx-auto max-w-md px-4  ">
        <Card
          className="overflow-hidden "
          style={{
            border: "none",
          }}
        >
          <CardHeader className="border-none">
            <h1 className="bg-gradient-to-r text-3xl  from-violet-600 to-purple-600 bg-clip-text text-transparent">
              locol
            </h1>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 pt-4">
                {Object.values(providers).map((provider: any) => (
                  <Button
                    key={provider.id}
                    onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                    className={`flex items-center justify-center gap-2 rounded-full ${
                      provider.id === "discord"
                        ? "bg-[#5865F2] hover:bg-[#4752c4]"
                        : "bg-gray-700 hover:bg-gray-800"
                    }`}
                  >
                    {provider.id === "discord" && <FaDiscord size={20} />}
                    Sign in / Sign up in locol with {provider.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}
