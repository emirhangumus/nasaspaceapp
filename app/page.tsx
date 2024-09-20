import { InitForm } from "@/components/forms/InitForm";
import { LoginForm } from "@/components/forms/LoginForm";
import prisma from "@/lib/db/prisma";

export const dynamic = 'force-dynamic';

export default async function Home() {

  const isUserExist = !!(await prisma.user.findFirst());


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
