import { CheckAuth } from "@/lib/CheckAuth";
import { register } from "@/lib/serverActions/auth";

export async function POST(request: Request) {
  try {
    await CheckAuth("ADMIN", request);

    const data = await request.json();
    const ret = await register(data, request);
    return new Response(JSON.stringify(ret), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to create user",
        data: null,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
