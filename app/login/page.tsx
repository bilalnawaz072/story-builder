import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "../auth"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Welcome to Narrative Engine</CardTitle>
                <CardDescription>Sign in to continue to your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    action={async () => {
                    "use server"
                    await signIn("google", { redirectTo: "/" })
                    }}
                >
                    <Button type="submit" className="w-full">Sign in with Google</Button>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}