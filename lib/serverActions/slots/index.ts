"use server";

import { CheckAuth } from "@/lib/CheckAuth";
import prisma from "@/lib/db/prisma";
import { isValidTimeRange, toISODateTime } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:mm

const createNewSlotSchema = z.object({
  start: z.string().regex(timeRegex, { message: "Invalid start time format" }),
  end: z.string().regex(timeRegex, { message: "Invalid end time format" }),
});

export const createNewSlot = async (
  rawData: any
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const currentUser = await CheckAuth("MENTOR");

    const data = createNewSlotSchema.parse(rawData);
    if (!isValidTimeRange(data.start, data.end)) {
      return {
        success: false,
        message: "Invalid time range",
      };
    }

    const existingSlots = await prisma.mentorSlots.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    if (existingSlots) {
      // check if the new slot is not overlapping with existing slots
      const newSlotStart = new Date(toISODateTime(data.start));
      const newSlotEnd = new Date(toISODateTime(data.end));

      const isOverlapping = existingSlots.some((slot) => {
        const existingSlotStart = slot.startTime;
        const existingSlotEnd = slot.endTime;
        console.log(
          newSlotStart,
          newSlotEnd,
          existingSlotStart,
          existingSlotEnd
        );
        return (
          (newSlotStart >= existingSlotStart &&
            newSlotStart <= existingSlotEnd) ||
          (newSlotEnd >= existingSlotStart && newSlotEnd <= existingSlotEnd)
        );
      });

      if (isOverlapping) {
        return {
          success: false,
          message: "Slot is overlapping with existing slots",
        };
      }
    }
    // console.log(
    //   generateTimeIntervals(SLOT_SKIP_INTERVAL, data.start, data.end, ":")
    // );

    // return {
    //   success: true,
    //   message: "Slot created successfully",
    // };

    await prisma.mentorSlots.create({
      data: {
        startTime: toISODateTime(data.start),
        endTime: toISODateTime(data.end),
        userId: currentUser.id,
      },
    });

    revalidatePath("/board/mentor/slots");
    return {
      success: true,
      message: "Slot created successfully",
    };
  } catch (e) {
    console.error(e);

    return {
      success: false,
      message: "Failed to create slot. Look for errors in the console",
    };
  }
};

const createMentorRequestSchema = z.object({
  mentorId: z.string(),
  start: z.string().regex(timeRegex, { message: "Invalid start time format" }),
  duration: z.number().int().positive(),
  note: z.string().optional(),
});

export const createMentorRequest = async (rawData: {
  mentorId: string;
  start: string;
  duration: number;
  note?: string;
}): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const currentUser = await CheckAuth("USER");

    const { duration, mentorId, start, note } =
      createMentorRequestSchema.parse(rawData);

    const mentor = await prisma.user.findUnique({
      where: {
        id: mentorId,
      },
    });

    if (!mentor) {
      return {
        success: false,
        message: "Mentor not found",
      };
    }

    const teamId = await prisma.teamUser.findFirst({
      where: {
        userId: currentUser.id,
      },
      select: {
        teamId: true,
      },
    });

    if (!teamId) {
      return {
        success: false,
        message: "User is not part of any team",
      };
    }

    // check the team for any existing mentor request
    const existingRequest = await prisma.mentorRequest.findFirst({
      where: {
        teamId: teamId.teamId,
        status: "PENDING",
      },
      select: {
        id: true,
      },
    });

    if (existingRequest) {
      return {
        success: false,
        message:
          "Your team already has a pending mentor request. To get another mentor, please cancel or finish the existing request",
      };
    }

    // endTime is start time + duration
    const endTime: Date = new Date(toISODateTime(start));
    endTime.setMinutes(endTime.getMinutes() + duration);
    const startTime = new Date(toISODateTime(start));

    console.log("Start time", startTime);
    console.log("End time", endTime);

    console.log(await prisma.mentorSlots.findMany());

    // split the mentorSlot into two parts
    // I think this is `AND` thing is not right but its working.
    const selectedSlot = await prisma.mentorSlots.findFirst({
      where: {
        userId: mentorId,
        AND: {
          startTime: {
            lte: startTime,
          },
          endTime: {
            gte: endTime,
          },
        },
      },
    });

    console.log(selectedSlot);

    if (!selectedSlot) {
      return {
        success: false,
        message: "Slot not found",
      };
    }

    // update the mentorSlot endTime
    await prisma.mentorSlots.update({
      where: {
        id: selectedSlot.id,
      },
      data: {
        endTime: startTime,
      },
    });
    // create new mentorSlot to fill the gap
    await prisma.mentorSlots.create({
      data: {
        userId: mentorId,
        startTime: endTime,
        endTime: selectedSlot.endTime,
      },
    });

    await prisma.mentorRequest.create({
      data: {
        teamId: teamId.teamId,
        userId: mentorId,
        endTime,
        startTime: new Date(toISODateTime(start)),
        status: "PENDING",
        note: note || "",
      },
    });

    revalidatePath("/board/need-help/[professionId]/[mentorId]/", "layout");

    return {
      success: true,
      message: "Mentor request created successfully",
    };
  } catch (e) {
    console.error(e);

    return {
      success: false,
      message:
        "Failed to create mentor request. Look for errors in the console",
    };
  }
};

export const deleteSlotWithRange = async (start: Date, end: Date) => {
  try {
    const user = await CheckAuth("MENTOR");

    await prisma.mentorSlots.deleteMany({
      where: {
        userId: user.id,
        AND: {
          startTime: {
            gte: start,
          },
          endTime: {
            lte: end,
          },
        },
      },
    });
    revalidatePath("/board/mentor/slots");
    return {
      success: true,
      message: "Slot deleted",
    };
  } catch {
    return {
      success: false,
      message: "Error",
    };
  }
};

export const getMentorRequestByTeam = async (teamId: string) => {
  try {
    const request = await prisma.mentorRequest.findFirst({
      where: {
        teamId,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            photo: true,
          },
        },
      },
    });

    return request;
  } catch {
    return null;
  }
};
