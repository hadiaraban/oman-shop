import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  return <CheckoutClient user={user} />;
}