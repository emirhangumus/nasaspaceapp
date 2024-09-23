"use server";

import { CheckAuth } from "@/lib/CheckAuth";
import prisma from "@/lib/db/prisma";
import { isValidTimeRange, toISODateTime } from "@/lib/utils";
import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createNewSlotSchema = z.object({
  start: z.string().regex(timeRegex, { message: "Invalid start time format" }),
  end: z.string().regex(timeRegex, { message: "Invalid end time format" }),
});

export const createNewSlot = async (rawData: any): Promise<boolean> => {
  try {
    const currentUser = await CheckAuth("MENTOR");
    console.log(currentUser);

    const data = createNewSlotSchema.parse(rawData);
    if (!isValidTimeRange(data.start, data.end)) {
      return false;
    }

    console.log(data);

    await prisma.mentorSlots.create({
      data: {
        startTime: toISODateTime(data.start),
        endTime: toISODateTime(data.end),
        userId: currentUser.id,
      },
    });

    console.log("a");

    return true;
  } catch (e) {
    console.log(e);

    return false;
  }
};
