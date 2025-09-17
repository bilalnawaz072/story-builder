import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { auth, signOut } from "@/app/auth"

export async function UserButton() {
    const session = await auth()
    if (!session?.user) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem asChild>
                    <form
                        action={async () => {
                        "use server"
                        await signOut()
                        }}
                    >
                        <button type="submit" className="w-full text-left">Sign Out</button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}