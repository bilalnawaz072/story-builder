import { auth } from "@/app/auth";
import { SignInButton, UserButton } from "@/components/auth/auth-buttons";
import Link from "next/link";

export async function Header() {
    const session = await auth();

    return (
        <header className="border-b">
            <div className="container mx-auto flex items-center justify-between p-4">
                <Link href="/" className="font-bold text-lg">
                    Narrative Engine
                </Link>

                <div>
                    {session?.user ? (
                        <UserButton user={session.user} />
                    ) : (
                        <SignInButton />
                    )}
                </div>
            </div>
        </header>
    )
}