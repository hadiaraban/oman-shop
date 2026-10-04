import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const count = await prisma.product.count();
  return NextResponse.json({ ok: true, productCount: count });
}