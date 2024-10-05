"use server";

import { CheckAuth } from "@/lib/CheckAuth";
import { Responser } from "@/lib/Responser";
import { JWT_SECRET } from "@/lib/contants";
import prisma from "@/lib/db/prisma";
import { NASAJWTPayload } from "@/lib/types";
import { RoleName } from "@prisma/client";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";
import { getTeam } from "../team";
import { getUserData } from "../user";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().max(255),
});

export const login = async (rowData: { email: string; password: string }) => {
  try {
    const data = loginSchema.parse(rowData);
    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return Responser({
        data: null,
        message: "User not found",
        success: false,
      });
    }

    const match = await bcrypt.compare(data.password, user.password);

    if (!match) {
      return Responser({
        data: null,
        message: "Password incorrect",
        success: false,
      });
    }

    if (!user) {
      return Responser({
        data: null,
        message: "User not found",
        success: false,
      });
    }

    const userData = await getUserData(data.email);

    if (!userData) {
      return Responser({
        data: null,
        message: "User not found",
        success: false,
      });
    }

    console.log(userData);

    const team = await getTeam(userData.teamId);

    const payload: NASAJWTPayload = {
      id: userData.id,
      name: userData.name,
      surname: userData.surname,
      role: userData.role,
    };

    console.log(team);

    if (team) {
      payload.teamId = team.id;
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Responser({
      data: null,
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return Responser({
      data: null,
      message: "Bad request",
      success: false,
    });
  }
};

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().max(255),
  name: z.string().max(255),
  surname: z.string().max(255),
  role: z.union([z.literal("ADMIN"), z.literal("USER"), z.literal("MENTOR")]),
});

export const register = async (
  rawData: {
    email: string;
    password: string;
    name: string;
    surname: string;
    role: RoleName;
  },
  req?: Request
) => {
  try {
    const data = registerSchema.parse(rawData);

    // if any user exist
    const isUserExist = !!(await prisma.user.findFirst());

    // if no user exist create admin
    if (!isUserExist) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: await bcrypt.hash(data.password, 10),
          name: data.name,
          surname: data.surname,
          role: "ADMIN",
        },
      });

      if (!user) {
        return Responser({
          data: null,
          message: "User not found",
          success: false,
        });
      }

      return Responser({
        data: null,
        message: "Success",
        success: true,
      });
    }

    const check = await CheckAuth("ADMIN", req);

    if (!check) {
      return Responser({
        data: null,
        message: "Unauthorized",
        success: false,
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (user) {
      return Responser({
        data: null,
        message: "User already exist",
        success: false,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        name: data.name,
        surname: data.surname,
        role: data.role,
      },
    });

    if (!newUser) {
      return Responser({
        data: null,
        message: "User creation failed",
        success: false,
      });
    }

    return Responser({
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname,
        role: newUser.role,
      },
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return Responser({
      data: null,
      message: "Bad request",
      success: false,
    });
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await CheckAuth();

    if (!user) {
      return Responser({
        data: null,
        message: "Unauthorized",
        success: false,
      });
    }

    return Responser({
      data: user,
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return Responser({
      data: null,
      message: "Bad request",
      success: false,
    });
  }
};

export const getCurrentUserRole = async () => {
  try {
    const user = await CheckAuth();

    if (!user) {
      return Responser({
        data: null,
        message: "Unauthorized",
        success: false,
      });
    }

    return Responser({
      data: user.role,
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return Responser({
      data: null,
      message: "Bad request",
      success: false,
    });
  }
};
