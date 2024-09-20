import prisma from "@/lib/db/prisma";

export const getTeam = async (teamCode: string | null) => {
  if (!teamCode) {
    return null;
  }

  const team = await prisma.team.findFirst({
    where: {
      code: teamCode,
    },
    include: {
      TeamUser: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return team;
};
