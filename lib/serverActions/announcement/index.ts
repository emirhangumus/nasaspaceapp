"use server";

import { CheckAuth } from "@/lib/CheckAuth";
import prisma from "@/lib/db/prisma";
import { Responser } from "@/lib/Responser";

export const createAnnouncement = async (data: {
  title: string;
  content: string;
}) => {
  try {
    const user = await CheckAuth("ADMIN");

    if (!user) {
      return {
        success: false,
        message: "You are not authorized to perform this action.",
      };
    }

    const n = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
      },
    });

    return Responser({
      success: true,
      message: "Announcement created successfully.",
      data: n,
    });
  } catch {
    return Responser({
      success: false,
      message: "An error occurred while creating the announcement",
      data: null,
    });
  }
};

export const getAnnouncements = async () => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return Responser({
      success: true,
      message: "Announcements fetched successfully.",
      data: announcements,
    });
  } catch {
    return Responser({
      success: false,
      message: "An error occurred while fetching announcements.",
      data: [],
    });
  }
};
