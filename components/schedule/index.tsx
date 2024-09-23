"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn, generateTimeIntervals } from "@/lib/utils";
import { SLOT_SKIP_INTERVAL } from "@/lib/contants";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Combobox } from "../ui/combobox";
import { Label } from "../ui/label";

type ScheduleProps = {
    startDate: Date;
    endDate: Date;
    slotSpace?: number;
    availableTimeSlots: { startDate: Date, endDate: Date }[];
    bookedTimeSlots: { startDate: Date, endDate: Date }[];
}

function dateToTimeString(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}.${minutes}`;
}

const SELECTABLE_MINUTES = [5, 10, 15, 20];

const DURATION_ITEMS = SELECTABLE_MINUTES.map((v) => {
    return { value: v.toString(), label: `${v} minutes` }
}, [])

export const Schedule = ({ startDate, endDate, slotSpace, availableTimeSlots, bookedTimeSlots }: ScheduleProps) => {
    const [schedule] = useState({
        startDate: startDate,
        // end date is 1 week from start date
        endDate: endDate,
        // slot space
        slotSpace: slotSpace || SLOT_SKIP_INTERVAL, // 5 minutes
        // list of available time slots
        availableTimeSlots: availableTimeSlots,
        // list of booked time slots
        bookedTimeSlots: bookedTimeSlots
    });
    const [isReady, setIsReady] = useState(false);
    const [reserveStart, setReserveStart] = useState<string>('');
    const [reserveMinutes, setReserveMinutes] = useState<number>(0);
    const [startTimeItems, setStartTimeItems] = useState<{ value: string, label: string }[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [notifyState, setNotifyState] = useState<{ message: string; type: 'idle' | 'success' | 'error'; }>({
        message: '',
        type: 'idle'
    });

    useEffect(() => {
        setTimeout(() => {
            setIsReady(true);
        }, 100);
    }, []);

    if (!isReady) {
        return <div>Loading...</div>
    }



    const handleApproveSlot = async () => {
        if (!reserveStart || !reserveMinutes) {
            return;
        }

        const selectable_index = SELECTABLE_MINUTES.findIndex((v) => v === reserveMinutes);
        if (selectable_index === -1) {
            return;
        }

        // if user select 20 minutes and the time is last 5 minutes of the slot then thow error
        const reverse_start_index = startTimeItems.findIndex((v) => v.value === reserveStart);

        if (reverse_start_index === -1) {
            return;
        }

        const is_valid = reverse_start_index + selectable_index < startTimeItems.length;

        if (!is_valid) {
            setNotifyState({ message: 'Invalid time selection', type: 'error' });
        } else {
            console.log('Valid time selection');
        }
    }

    return (
        <div className="flex flex-col">
            <div className="grid gap-1">
                {schedule.availableTimeSlots.map((slot, index) => {
                    return (
                        <Dialog key={index} open={isOpen} onOpenChange={(value) => {
                            setStartTimeItems(generateTimeIntervals(5, dateToTimeString(slot.startDate), dateToTimeString(slot.endDate)).map((v) => {
                                return { value: v, label: v }
                            }));
                            setIsOpen(value);
                        }}>
                            <DialogTrigger asChild>
                                <Button key={index} className={cn("border", "border-blue-500", "text-blue-500", "rounded-lg", "hover:bg-blue-500", "hover:text-white")}>
                                    {dateToTimeString(slot.startDate)} - {dateToTimeString(slot.endDate)}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Are you sure?</DialogTitle>
                                    <DialogDescription>
                                        Do you really want to approve this slot?
                                    </DialogDescription>
                                </DialogHeader>
                                <Label>Select start time</Label>
                                <Combobox items={startTimeItems} onSelect={(value) => setReserveStart(value)} noItemsMessage="No slots available" placeholder="Select start time" searchPlaceholder="Search start time" />
                                <Label>Select duration</Label>
                                <Combobox items={DURATION_ITEMS} onSelect={(value) => setReserveMinutes(Number(value))} noItemsMessage="No slots available" placeholder="Select duration" searchPlaceholder="Search duration" />
                                <DialogFooter>
                                    <div className="flex flex-row gap-2 justify-end">
                                        <DialogClose asChild>
                                            <Button className={cn("border", "border-red-500", "text-red-500", "rounded-lg", "hover:bg-red-500", "hover:text-white")}>Cancel</Button>
                                        </DialogClose>
                                        <Button onClick={handleApproveSlot} className={cn("border", "border-blue-500", "text-blue-500", "rounded-lg", "hover:bg-blue-500", "hover:text-white")}>Approve</Button>
                                    </div>
                                    {notifyState.message && <div className={cn("text-white", "text-sm", "mt-2", notifyState.type === 'success' ? 'text-green-500' : 'text-red-500')}>{notifyState.message}</div>}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )
                })}
            </div>
        </div >
    )
}
