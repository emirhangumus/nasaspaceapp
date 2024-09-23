"use server";

import { Profession } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type Mentor = {
    id: string;
    name: string;
    surname: string;
    photo: string | null;
    professions: Profession[];
}

export async function MentorBox({ mentor }: { mentor: Mentor }) {
    return (
        <Link className="flex flex-row gap-4 items-center border-2 border-blue-700 hover:bg-blue-900 hover:border-blue-600 transition-colors px-4 py-2 rounded-lg" href={`/board/need-help/1/${mentor.id}`}>
            <div className="w-12 h-12 relative">
                <Image src={mentor.photo || "/nasa.png"} alt="NASA Logo" fill className="object-cover rounded-full" />
            </div>
            <div className="flex flex-col">
                <span>{mentor.name} {mentor.surname}</span>
                <div>
                    {mentor.professions.map((profession, i) => (
                        <span key={profession.id} className="text-xs">
                            {profession.name}{i < mentor.professions.length - 1 ? ", " : ""}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    )
}