"use server";

import { CheckAuth } from "@/lib/CheckAuth";
import prisma from "@/lib/db/prisma";
import { MentorRequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
  try {
    await CheckAuth();
  } catch {
    return null;
  }
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
  try {
    await CheckAuth();
  } catch {
    return null;
  }
  const ret = await prisma.mentorSlots.findMany({
    where: {
      userId: mentorId,
    },
  });

  return ret;
};

export type TMentorSlots = {
  [key in MentorRequestStatus]: {
    id: number;
    startTime: Date;
    endTime: Date;
    team: {
      id: string;
      name: string;
    };
    note?: string;
    createdAt?: Date;
  }[];
} & {
  EMPTY: {
    id: number;
    startTime: Date;
    endTime: Date;
  }[];
};

export const getMentorSlotsWithStatus = async (
  mentorId: string
): Promise<TMentorSlots> => {
  try {
    await CheckAuth();
  } catch {
    return {
      DONE: [],
      PENDING: [],
      CANCELED: [],
      EMPTY: [],
    };
  }
  const mentorRequests = await prisma.mentorRequest.findMany({
    where: {
      userId: mentorId,
    },
    orderBy: {
      startTime: "asc",
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      note: true,
      createdAt: true,
    },
  });

  const mentorSlots = await prisma.mentorSlots.findMany({
    where: {
      userId: mentorId,
    },
    orderBy: {
      startTime: "asc",
    },
    select: {
      startTime: true,
      endTime: true,
      id: true,
    },
  });

  const slots: TMentorSlots = {
    DONE: [],
    PENDING: [],
    CANCELED: [],
    EMPTY: [],
  };

  mentorSlots.forEach((slot) => {
    slots["EMPTY"].push({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  });

  mentorRequests.forEach((request) => {
    slots[request.status].push({
      id: request.id,
      startTime: request.startTime,
      endTime: request.endTime,
      team: {
        id: request.team.id,
        name: request.team.name,
      },
      note: request.note,
      createdAt: request.createdAt,
    });
  });

  return slots;
};

export const cancelMentorRequest = async (requestId: number) => {
  try {
    const currentUser = await CheckAuth("MENTOR");

    // check the request for is mentor's
    const request = await prisma.mentorRequest.findFirst({
      where: {
        id: requestId,
        userId: currentUser.id,
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Request not found",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "Request is not pending",
      };
    }

    await prisma.mentorRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "CANCELED",
      },
    });

    revalidatePath("/board/mentor/slots", "page");

    return {
      success: true,
      message: "Request cancelled",
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to cancel request",
    };
  }
};

export const markAsDoneMentorRequest = async (requestId: number) => {
  try {
    const currentUser = await CheckAuth("MENTOR");

    // check the request for is mentor's
    const request = await prisma.mentorRequest.findFirst({
      where: {
        id: requestId,
        userId: currentUser.id,
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Request not found",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "Request is not pending",
      };
    }

    await prisma.mentorRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "DONE",
      },
    });

    revalidatePath("/board/mentor/slots", "page");

    return {
      success: true,
      message: "Request marked as done",
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to mark request as done",
    };
  }
};

export const cancelMentorRequestByTeam = async (requestId: number) => {
  try {
    const currentUser = await CheckAuth("USER");

    // check is the request for user's team
    const request = await prisma.mentorRequest.findFirst({
      where: {
        id: requestId,
        teamId: currentUser.teamId,
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Request not found",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "Request is not pending",
      };
    }

    await prisma.mentorRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "CANCELED",
      },
    });

    revalidatePath("/board", "page");

    return {
      success: true,
      message: "Request cancelled",
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to cancel request",
    };
  }
};
