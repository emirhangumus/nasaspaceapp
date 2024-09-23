"use server";

import { CheckAuth } from "@/lib/CheckAuth";
import prisma from "@/lib/db/prisma";
import { MentorRequestStatus } from "@prisma/client";

export const getMentor = async (teamId: string) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
    },
  });

  if (!team) {
    return null;
  }

  if (!team.mentorId) {
    return null;
  }

  return await prisma.user.findFirst({
    where: {
      id: team.mentorId,
      role: "MENTOR",
    },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      photo: true,
      MentorProfession: true,
    },
  });
};

export const getMentorBy = async (type: "id" | "email", thing: string) => {
  try {
    await CheckAuth(["ADMIN", "MENTOR"]);
  } catch {
    return null;
  }
  const ret = await prisma.user.findFirst({
    where: {
      [type]: thing,
      role: "MENTOR",
    },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      photo: true,
      MentorProfession: {
        select: {
          Profession: true,
        },
      },
    },
  });

  if (!ret) {
    return null;
  }

  return {
    id: ret.id,
    email: ret.email,
    name: ret.name,
    surname: ret.surname,
    photo: ret.photo,
    professions: ret.MentorProfession.map((mp) => mp.Profession),
  };
};

export const getMentorsByProfession = async (professionId: number) => {
  const ret = await prisma.user.findMany({
    where: {
      MentorProfession: {
        some: {
          professionId: professionId,
        },
      },
      role: "MENTOR",
    },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      photo: true,
      MentorProfession: {
        select: {
          Profession: true,
        },
      },
    },
  });

  return ret.map((mentor) => {
    return {
      id: mentor.id,
      email: mentor.email,
      name: mentor.name,
      surname: mentor.surname,
      photo: mentor.photo,
      professions: mentor.MentorProfession.map((mp) => mp.Profession),
    };
  });
};

export const getMentorSlots = async (mentorId: string) => {
  const ret = await prisma.mentorSlots.findMany({
    where: {
      userId: mentorId,
    },
  });

  return ret;
};

type MentorSlots = {
  [key in MentorRequestStatus]: {
    startTime: string;
    endTime: string;
  }[];
} & {
  EMPTY: {
    startTime: string;
    endTime: string;
  }[];
};

export const getMentorSlotsWithStatus = async (
  mentorId: string
): Promise<MentorSlots> => {
  const mentorRequests = await prisma.mentorRequest.findMany({
    where: {
      userId: mentorId,
    },
  });

  const mentorSlots = await prisma.mentorSlots.findMany({
    where: {
      userId: mentorId,
    },
  });

  const slots: MentorSlots = {
    DONE: [],
    PENDING: [],
    REJECTED: [],
    EMPTY: [],
  };

  mentorSlots.forEach((slot) => {
    const start = new Date(slot.startTime).getTime();
    const end = new Date(slot.endTime).getTime();

    const requests = mentorRequests.filter((request) => {
      const reqStart = new Date(request.startTime).getTime();
      const reqEnd = new Date(request.endTime).getTime();

      return reqStart >= start && reqEnd <= end;
    });

    if (requests.length === 0) {
      slots.EMPTY.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    } else {
      const status = requests[0].status;
      slots[status].push({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });

      mentorRequests.splice(
        mentorRequests.findIndex((req) => req.id === requests[0].id),
        1
      );

      if (mentorRequests.length === 0) {
        return slots;
      }

      return;
    }
  });

  return slots;
};
