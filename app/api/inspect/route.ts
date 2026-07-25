import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const backendResponse = await fetch(`${FASTAPI_URL}/inspect`, {
    method: "POST",
    body: formData,
  });

  const data = await backendResponse.json();

  return NextResponse.json(data, { status: backendResponse.status });
}
