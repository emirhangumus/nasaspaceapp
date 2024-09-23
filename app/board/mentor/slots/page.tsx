import { getCurrentUser } from "@/lib/serverActions/auth";
import { getMentorBy, getMentorSlotsWithStatus } from "@/lib/serverActions/mentor";
import { redirect } from "next/navigation";
import { MentorSlots } from "./_components/MentorSlots";

export const dynamic = 'force-dynamic';

export default async function MentorBoard() {
    const user = await getCurrentUser();
    if (!user.success || !user.data?.id) redirect("/");
    const mentor = await getMentorBy('id', user.data.id);
    if (!mentor) redirect("/");

    const currentSlots = await getMentorSlotsWithStatus(mentor.id);

    return (
        <div>
            <div className="flex flex-col gap-8">
                <MentorSlots mentor={mentor} slots={currentSlots} />
            </div>
        </div>
    )
}