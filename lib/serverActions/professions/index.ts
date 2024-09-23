"use server";

import prisma from "@/lib/db/prisma";
import { Profession } from "@prisma/client";

export const getAllProfessions = async (): Promise<Profession[]> => {
  return await prisma.profession.findMany();
};

export const getProfession = async (id: number): Promise<Profession | null> => {
  if (Number.isNaN(id)) {
    return null;
  }

  return await prisma.profession.findFirst({
    where: {
      id: id,
    },
  });
};
