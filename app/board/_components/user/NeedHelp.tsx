import { Profession } from "@prisma/client";
import Link from "next/link";

type NeedHelpCardProps = {
    professions: Profession[];
};

export function NeedHelpCard({ professions }: NeedHelpCardProps) {
    return (
        <div>
            <h2 className="text-3xl font-bold font-mono border-b border-blue-300 pb-2 mb-2">Get Help from Mentors</h2>
            <p className="font-mono mb-4">For start, select a proffesion.</p>
            <div className="flex flex-row gap-4 flex-wrap font-mono">
                {professions.map((profession) => (
                    <div key={profession.id} className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center border-2 border-blue-300 px-4 py-1 hover:bg-blue-700 transition-colors hover:text-white cursor-pointer">
                            <Link href={`/board/need-help/${profession.id}`}>{profession.name}</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}