import { Schedule } from "@/components/schedule";
import { getMentorSlotsWithStatus } from "@/lib/serverActions/mentor";

export const dynamic = 'force-dynamic';

type PageParams = {
    professionId: string;
    mentorId: string;
};

export default async function Page({ params }: { params: PageParams }) {

    const currentSlots = await getMentorSlotsWithStatus(params.mentorId);

    const availableTimeSlots = currentSlots.EMPTY.map(slot => {
        return {
            startDate: new Date(slot.startTime),
            endDate: new Date(slot.endTime)
        }
    });

    const bookedTimeSlots = currentSlots.PENDING.map(slot => {
        return {
            startDate: new Date(slot.startTime),
            endDate: new Date(slot.endTime)
        }
    });
    console.log(availableTimeSlots, bookedTimeSlots);

    return (
        <>
            <pre>{JSON.stringify(currentSlots, null, 2)}</pre>
            <div>
                <h2 className="text-3xl font-bold font-mono border-b border-blue-300 pb-2">Mentor Request</h2>
            </div>
            <div className="flex flex-col gap-4 font-mono my-4">
                <span className="text-2xl font-bold">Mentors</span>
                <Schedule startDate={new Date()} endDate={new Date(new Date().setDate(new Date().getDate() + 2))} availableTimeSlots={availableTimeSlots} bookedTimeSlots={bookedTimeSlots} />
            </div>
        </>
    )
}