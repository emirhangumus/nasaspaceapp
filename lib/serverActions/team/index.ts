"use server";

import prisma from "@/lib/db/prisma";
import { Responser } from "@/lib/Responser";
import { z } from "zod";
import { getMentor } from "../mentor";
import { CheckAuth } from "@/lib/CheckAuth";

const consonants_numbers = "bcdfghjklmnpqrstvwxyz0123456789";

const generateTeamID = async () => {
  // it hae to start with a letter and be 6 characters long
  do {
    const id =
      "T" +
      Array.from(
        { length: 5 },
        () =>
          consonants_numbers[
            Math.floor(Math.random() * consonants_numbers.length)
          ]
      )
        .join("")
        .toUpperCase();
    const team = await prisma.team.findFirst({
      where: {
        id: id,
      },
    });

    if (!team) return id;
  } while (true);
};

const teamCreateSchema = z.object({
  name: z.string(),
});

export const createTeam = async (rawData: z.infer<typeof teamCreateSchema>) => {
  try {
    const data = teamCreateSchema.parse(rawData);
    const team = await prisma.team.create({
      data: {
        id: await generateTeamID(),
        ...data,
      },
    });

    return Responser({
      data: team,
      message: "Team created",
      success: true,
    });
  } catch {
    return Responser({
      message: "Failed to create team",
      success: false,
      data: null,
    });
  }
};

export type TeamData = {
  users: {
    id: string;
    name: string;
    email: string;
    surname: string;
  }[];
  id: string;
  name: string;
  mentorId: string | null;
  mentor: {
    id: string;
    name: string;
    email: string;
    surname: string;
    photo: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

export const getTeam = async (id: string | null): Promise<TeamData | null> => {
  if (!id) {
    return null;
  }

  const team = await prisma.team.findFirst({
    where: {
      id: id,
    },
  });

  if (!team) {
    return null;
  }
  const teamUsers = await prisma.teamUser.findMany({
    where: {
      teamId: team.id,
    },
    select: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          photo: true,
        },
      },
    },
  });

  const mentor = team.mentorId ? await getMentor(team.id) : null;

  return {
    ...team,
    users: teamUsers.map((tu) => tu.user),
    mentor: mentor ? mentor : null,
  };
};

export const assignUserToTeam = async (
  {
    teamId,
    userId,
  }: {
    teamId: string;
    userId: string;
  },
  request?: Request
) => {
  try {
    await CheckAuth("ADMIN", request);

    if (!teamId || !userId) {
      return Responser({
        message: "Invalid data",
        success: false,
        data: null,
      });
    }

    // if user is already assigned to team, remove them
    const existing = await prisma.teamUser.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });

    if (existing) {
      await prisma.teamUser.delete({
        where: {
          id: existing.id,
        },
      });
    }

    await prisma.teamUser.create({
      data: {
        teamId: teamId,
        userId: userId,
      },
    });

    return Responser({
      data: null,
      message: "User assigned to team",
      success: true,
    });
  } catch {
    return Responser({
      message: "Failed to assign user to team",
      success: false,
      data: null,
    });
  }
};
