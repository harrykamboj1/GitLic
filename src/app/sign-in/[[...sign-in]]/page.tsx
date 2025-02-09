import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Page() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="h-full flex-col items-center justify-center px-4 lg:flex">
        <div className="space-y-4 pt-16 text-center">
          <h1 className="text-3xl font-bold">Welcome</h1>
        </div>
        <p className="text-base text-zinc-400">
          Log in or Create account to get back to your dashboard
        </p>
        <div className="mt-8 flex items-center justify-center">
          <ClerkLoaded>
            <SignIn
              appearance={{
                elements: {
                  footer: "hidden",
                },
              }}
            />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="animate-spin text-muted-foreground" />
          </ClerkLoading>
        </div>
      </div>
      <div className="hidden h-full items-center justify-center bg-gradient-to-bl from-blue-500 via-blue-500 to-purple-500 lg:flex">
        <Image src={"/logo.png"} alt="Logo" height={300} width={300} />
      </div>
    </div>
  );
}
