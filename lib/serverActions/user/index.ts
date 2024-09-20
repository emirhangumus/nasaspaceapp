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
      role: true,
      teamId: true,
      professionId: true,
    },
  });

  return user;

  //   if (!user) {
  //     return null;
  //   }

  //   if (user.role.name == "USER") {
  //     const ret = await prisma.user.findFirst({
  //       where: {
  //         email,
  //       },
  //       select: {
  //         id: true,
  //         email: true,
  //         role: true,
  //         name: true,
  //         surname: true,
  //         teamId: true,
  //       },
  //     });
  //     return ret;
  //   }
  //   if (user.role.name == "MENTOR") {
  //     const ret = await prisma.user.findFirst({
  //       where: {
  //         email,
  //       },
  //       select: {
  //         id: true,
  //         email: true,
  //         role: true,
  //         name: true,
  //         surname: true,
  //       },
  //     });
  //     return ret;
  //   }

  //   return null;
};
