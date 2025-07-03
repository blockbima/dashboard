// app/api/contracts/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const url = `${process.env.GATEWAY_URL}/blockbima-svc/v1/contracts/${id}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.BLOCKBIMA_API_KEY || "",
    },
  });
  if (!res.ok) return NextResponse.error();
  const data = await res.json();
  return NextResponse.json(data);
}
