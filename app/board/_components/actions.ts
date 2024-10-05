"use server";

import prisma from "@/lib/db/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:me@emirhangumus.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscription, userId: string) {
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })

  await prisma.notificationSubs.deleteMany({
    where: {
      userId: userId,
    },
  });

  await prisma.notificationSubs.create({
    data: {
      data: sub,
      userId: userId,
    },
  });

  return { success: true };
}

export async function unsubscribeUser(userId: string) {
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  console.log("Unsubscribing user", userId);

  await prisma.notificationSubs.deleteMany({
    where: {
      userId: userId,
    },
  });

  return { success: true };
}

export async function sendNotification(
  {
    title,
    message,
  }: {
    title: string;
    message: string;
  },
  userIds: string[]
) {
  const subs = await prisma.notificationSubs.findMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  if (!subs.length) {
    return { success: false, error: "No subscriptions found" };
  }

  try {
    for (const sub of subs) {
      await webpush.sendNotification(
        // @ts-ignore
        sub.data,
        JSON.stringify({
          title,
          body: message,
          icon: "/icon.png",
        })
      );
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
