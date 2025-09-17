'use client';

import { signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Session } from "next-auth";
import Link from "next/link";

// Button for users who are NOT logged in
export function SignInButton() {
  return (
    <Button asChild>
        <Link href="/login">Sign In</Link>
    </Button>
  );
}

// Button/Avatar for users who ARE logged in
export function UserButton({ user }: { user: Session['user']}) {
    if (!user) return <SignInButton />;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}