import { RoleName } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JWT_SECRET } from "./contants";
import { NASAJWTPayload } from "./types";

export const CheckAuth = async (
  is?: RoleName | RoleName[],
  req?: Request
): Promise<NASAJWTPayload> => {
  // Check if the Authorization header is present
  const authHeader = req?.headers.get("authorization");

  let token: string | undefined;

  if (authHeader) {
    // Extract the token from the Authorization header
    token = authHeader.split(" ")[1];
  } else {
    // If no Authorization header, check for the token in cookies
    token = cookies().get("token")?.value;
  }

  // If no token found, return false
  if (!token) throw new Error("No token found");

  // Verify the token
  try {
    const ret = await jwtVerify<NASAJWTPayload>(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (is)
      if (Array.isArray(is)) {
        if (!is.includes(ret.payload.role as RoleName))
          throw new Error("Invalid role");
      } else {
        if (ret.payload.role !== is) throw new Error("Invalid role");
      }

    return ret.payload as NASAJWTPayload;
  } catch (error) {
    console.log(error);

    throw new Error("Invalid token");
  }
};
