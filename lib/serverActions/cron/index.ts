"use server";

import prisma from "@/lib/db/prisma";

let i = false;

/**
 * This is not a real cron job, just a setInterval function that runs every second
 *  But it can be used to run cron jobs. At least, i think so.
 */
export const startCronJob = async () => {
  if (i) return;
  i = true;
  setInterval(async () => {
    await deleteAllMentorSlots();
  }, 1000);
};

const deleteAllMentorSlots = async () => {
  await prisma.mentorSlots.deleteMany();
};
