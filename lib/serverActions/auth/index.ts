"use server";

import bcrypt from "bcrypt";
import { z } from "zod";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { Responser, ResponserReturn } from "@/lib/Responser";
import prisma from "@/lib/db/prisma";
import { getTeam } from "../team";
import { getUserData } from "../user";
import { JWT_SECRET } from "@/lib/contants";
import { NASAJWTPayload } from "@/lib/types";
import { CheckAuth } from "@/lib/CheckAuth";
import { RoleName } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().max(255),
});

export const login = async (rowData: {
  email: string;
  password: string;
}): Promise<ResponserReturn> => {
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

    const team = await getTeam(userData.teamId);

    const payload: NASAJWTPayload = {
      email: userData.email,
      role: userData.role,
    };

    if (team) {
      payload.teamCode = team.code;
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

export const register = async (rowData: {
  email: string;
  password: string;
  name: string;
  surname: string;
  role: RoleName;
}): Promise<ResponserReturn> => {
  try {
    const data = registerSchema.parse(rowData);

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

    const check = await CheckAuth("ADMIN");

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
      data: null,
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
