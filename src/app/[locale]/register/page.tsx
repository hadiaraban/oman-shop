"use client";

import { useActionState } from "react";
import { registerUser, type RegisterState } from "@/actions/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const initialState: RegisterState = { success: false, message: "" };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="mb-6 text-2xl font-bold">Create Account</h1>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input name="name" required minLength={2} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input name="email" type="email" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <Input name="password" type="password" required minLength={6} />
            </div>

            {state.message && (
              <p
                className={`text-sm ${
                  state.success ? "text-green-600" : "text-destructive"
                }`}
              >
                {state.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}