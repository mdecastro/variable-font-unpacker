import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const backendResponse = await fetch(`${FASTAPI_URL}/extract`, {
    method: "POST",
    body: formData,
  });

  if (!backendResponse.ok) {
    const error = await backendResponse
      .json()
      .catch(() => ({ detail: "Extraction failed" }));
    return NextResponse.json(error, { status: backendResponse.status });
  }

  return new NextResponse(backendResponse.body, {
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "font/ttf",
      "Content-Disposition":
        backendResponse.headers.get("content-disposition") ?? "attachment",
    },
  });
}
