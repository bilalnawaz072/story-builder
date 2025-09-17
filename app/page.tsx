import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "./auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="container mx-auto text-center py-20">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
        Welcome to the Narrative Engine
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
        Your collaborative partner in crafting complex, branching stories. Turn
        your ideas into interactive experiences with the power of AI.
      </p>

      <div className="mt-8">
        {session?.user ? (
          <Button asChild size="lg">
            <Link href="/stories">Go to Your Dashboard</Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href="/login">Get Started for Free</Link>
          </Button>
        )}
      </div>
    </div>
  );
}