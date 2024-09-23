import { Button } from "@/components/ui/button";
import { getMentorBy } from "@/lib/serverActions/mentor";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type Params = {
    userId: string;
}

export default async function Page({ params }: { params: Params }) {

    const mentor = await getMentorBy('id', params.userId);

    if (!mentor) return redirect("/");

    return (
        <>
            <div>
                <h2 className="text-3xl font-bold font-mono border-b border-blue-300 pb-2">Mentor Profile</h2>
            </div>
            <div className="flex gap-4 font-mono my-4">
                <div className="w-24 h-24 relative">
                    <Image src={mentor.photo || "/nasa.png"} alt="NASA Logo" className="object-cover rounded-full" fill />
                </div>
                <div className="flex flex-col py-4">
                    <span className="text-2xl font-bold">{mentor.name} {mentor.surname}</span>
                    <div className="flex flex-col gap-2">
                        {mentor.professions.map((profession) => (
                            <span key={profession.id} className="text-xs">
                                {profession.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <Button asChild>
                <Link href={`/board/mentor/request/${mentor.id}`}>
                    Request Mentorship
                </Link>
            </Button>
        </>
    )
}