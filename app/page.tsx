import { InitForm } from "@/components/forms/InitForm";
import { LoginForm } from "@/components/forms/LoginForm";
import prisma from "@/lib/db/prisma";
// import { startCronJob } from "@/lib/serverActions/cron";

export const dynamic = 'force-dynamic';

export default async function Home() {

  const isUserExist = !!(await prisma.user.findFirst());

  // await startCronJob();

  return (
    <div className="flex justify-center items-center h-screen">
      {isUserExist ? (
        <LoginForm />
      ) : (
        <InitForm />
      )}
    </div>
  );
}
