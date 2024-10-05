import { CheckAuth } from "@/lib/CheckAuth";
import { assignUserToTeam, createTeam } from "@/lib/serverActions/team";

export async function POST(request: Request) {
  try {
    await CheckAuth("ADMIN", request);
    const data = await request.json();
    const ret = await createTeam(data);
    return new Response(JSON.stringify(ret), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to create team",
        data: null,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await CheckAuth("ADMIN", request);

    const data = await request.json();
    console.log(data);
    const ret = await assignUserToTeam(data, request);
    return new Response(JSON.stringify(ret), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to assign user to team",
        data: null,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
