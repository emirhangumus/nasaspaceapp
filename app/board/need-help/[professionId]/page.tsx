import { MentorBox } from "@/components/MentorBox";
import { getMentorsByProfession } from "@/lib/serverActions/mentor";
import { getProfession } from "@/lib/serverActions/professions";
import { redirect } from "next/navigation";
import { Fragment } from "react";

type Params = {
    professionId: string;
}

export const metadata = {
    title: "Mentor Request",
    description: "Find mentors for your profession",
}

export default async function Page({ params }: { params: Params }) {

    const profession = await getProfession(+params.professionId);

    if (!profession) return redirect("/board");

    const mentors = await getMentorsByProfession(profession.id);

    if (!mentors) return redirect("/board");

    return (
        <Fragment>
            <div>
                <h2 className="text-3xl font-bold font-mono border-b border-blue-300 pb-2">Mentor Request</h2>
            </div>
            <div className="flex flex-col gap-4 font-mono my-4">
                <span>You selected: <span className="text-2xl font-bold relative">{profession.name}</span></span>
            </div>
            <div className="flex flex-col gap-4 font-mono my-4">
                <span className="text-2xl font-bold">Mentors</span>
                <div className="flex flex-col gap-4">
                    {mentors.length > 0 ? mentors.map((mentor) => (
                        <MentorBox key={mentor.id} mentor={mentor} />
                    )) : <span>No mentors available</span>}
                </div>
            </div>
        </Fragment>
    )
}