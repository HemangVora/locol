import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Link from "next/link";

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  const errorMessages: { [key: string]: string } = {
    default: "An error occurred during authentication.",
    Signin: "Try signing in with a different account.",
    OAuthSignin: "Error occurred during OAuth sign-in.",
    OAuthCallback: "Error occurred during OAuth callback.",
    OAuthCreateAccount: "Error creating OAuth user account.",
    EmailCreateAccount: "Error creating email user account.",
    Callback: "Error in the OAuth callback.",
    OAuthAccountNotLinked:
      "Account is already linked to a different credential.",
    EmailSignin: "Error sending OAuth email.",
    CredentialsSignin: "Credentials sign in failed.",
    SessionRequired: "You must be signed in to access this page.",
  };

  const errorMessage =
    error && typeof error === "string" && error in errorMessages
      ? errorMessages[error]
      : errorMessages.default;

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-md px-4">
        <Card className="overflow-hidden border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-8 text-white">
            <CardTitle className="text-center text-2xl font-bold">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <p>{errorMessage}</p>
                {error === "OAuthAccountNotLinked" && (
                  <p className="mt-2 text-sm">
                    You previously logged in with a different account. Please
                    use the same account to log in again.
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Link href="/auth/signin" passHref>
                  <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                    Try Again
                  </Button>
                </Link>
                <Link href="/" passHref>
                  <Button variant="outline" className="rounded-full">
                    Return Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
