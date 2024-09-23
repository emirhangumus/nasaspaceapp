"use client";

import { PageHeading } from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SLOT_SKIP_INTERVAL } from "@/lib/contants";
import { getMentorBy, getMentorSlots } from "@/lib/serverActions/mentor";
import { createNewSlot } from "@/lib/serverActions/slots";
import type { AwaitedReturnType } from "@/lib/types";
import { generateDayTimes } from "@/lib/utils";
import { useEffect, useState } from "react";

type MentorSlotsProps = {
    mentor: AwaitedReturnType<typeof getMentorBy>;
    slots: AwaitedReturnType<typeof getMentorSlots>;
};

const dayTimes = generateDayTimes(SLOT_SKIP_INTERVAL);

const startItems = dayTimes.map((time) => ({
    value: time,
    label: time,
}));

export const MentorSlots = ({ mentor, slots }: MentorSlotsProps) => {
    const [startDate, setStartDate] = useState<string>('');
    const [endItems, setEndItems] = useState<{ value: string, label: string }[]>([]);
    const [endDate, setEndDate] = useState<string>('');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (startDate) {
            const startIndex = dayTimes.findIndex((time) => time === startDate);
            setEndItems(dayTimes.slice(startIndex + 1).map((time) => ({
                value: time,
                label: time,
            })));
        }
    }, [startDate]);

    useEffect(() => {
        if (startDate && endDate) {
            setReady(true);
        }
    }, [startDate, endDate]);

    const handleCreateSlot = async () => {
        const x = await createNewSlot({ start: startDate, end: endDate });
        console.log(x);
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <PageHeading title="Mentor Slots" subtitle="Create and manage your slots. Slots are daily time slots when you are available for mentoring." />
                <div className="flex flex-col gap-8">
                    <div className="flex gap-8">
                        <Combobox items={startItems} onSelect={(value) => setStartDate(value)} noItemsMessage="No slots available" placeholder="Select start time" searchPlaceholder="Search start time" />
                        <Combobox items={endItems} onSelect={(value) => setEndDate(value)} noItemsMessage="Select start first." placeholder="Select end time" searchPlaceholder="Search end time" />
                    </div>
                    <Button disabled={!ready} onClick={handleCreateSlot}>Create Slot</Button>
                </div>
            </div>
            <div>
                <PageHeading title="Opened Slots" subtitle="Here are your opened slots. You can close them at any time." />
                <div className="flex flex-col gap-8">
                    <pre>{JSON.stringify(slots, null, 2)}</pre>
                </div>
            </div>
        </div>
    )
}