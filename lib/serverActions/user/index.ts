import prisma from "@/lib/db/prisma";

export const getUserData = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      photo: true,
      role: true,
    },
  });

  if (!user) return null;

  const team = await prisma.team.findFirst({
    where: {
      TeamUser: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  return {
    ...user,
    teamId: team ? team.id : null,
  };
};
