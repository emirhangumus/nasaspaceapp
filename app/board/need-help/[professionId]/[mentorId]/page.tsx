import { Schedule } from "@/components/schedule";
import { getMentorSlotsWithStatus } from "@/lib/serverActions/mentor";
import { Fragment } from "react";

export const dynamic = 'force-dynamic';

type PageParams = {
    professionId: string;
    mentorId: string;
};

export const metadata = {
    title: "Mentor Request",
    description: "Schedule a time with mentor",
}

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

    return (
        <Fragment>
            <div>
                <h2 className="text-3xl font-bold font-mono border-b border-blue-300 pb-2">Mentor Request</h2>
            </div>
            <div className="flex flex-col gap-4 font-mono my-4">
                <span className="font-bold">
                    Schedule a time with mentor
                </span>
                <Schedule mentorId={params.mentorId} startDate={new Date()} endDate={new Date(new Date().setDate(new Date().getDate() + 2))} availableTimeSlots={availableTimeSlots} bookedTimeSlots={bookedTimeSlots} />
            </div>
        </Fragment>
    )
}