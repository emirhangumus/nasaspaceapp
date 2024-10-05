"use client";

import { Fragment, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn, dateToTimeString, generateTimeIntervals } from "@/lib/utils";
import { SLOT_SKIP_INTERVAL } from "@/lib/contants";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Combobox } from "../ui/combobox";
import { Label } from "../ui/label";
import { createMentorRequest } from "@/lib/serverActions/slots";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";

type ScheduleProps = {
    startDate: Date;
    endDate: Date;
    slotSpace?: number;
    availableTimeSlots: { startDate: Date, endDate: Date }[];
    bookedTimeSlots: { startDate: Date, endDate: Date }[];
    mentorId: string;
}

const SELECTABLE_MINUTES = [5, 10, 15, 20];

const DURATION_ITEMS = SELECTABLE_MINUTES.map((v) => {
    return { value: v.toString(), label: `${v} minutes` }
}, [])

export const Schedule = ({ mentorId, startDate, endDate, slotSpace, availableTimeSlots, bookedTimeSlots }: ScheduleProps) => {
    const [schedule] = useState({
        startDate: startDate,
        // end date is 1 week from start date
        endDate: endDate,
        // slot space
        slotSpace: slotSpace || SLOT_SKIP_INTERVAL,
        // list of available time slots
        availableTimeSlots: availableTimeSlots,
        // list of booked time slots
        bookedTimeSlots: bookedTimeSlots
    });
    const [isReady, setIsReady] = useState(false);
    const [startTimeItems, setStartTimeItems] = useState<{ value: string, label: string }[]>([]);

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsReady(true);
        }, 100);
    }, []);

    if (!isReady) {
        return <div>Loading...</div>
    }

    const closeDialogCallback = () => {
        setIsOpen(false);
    }

    return (
        <div className="flex flex-col">
            <div className="grid gap-1">
                {schedule.availableTimeSlots.length > 0 ? schedule.availableTimeSlots.map((slot, index) => {
                    return (
                        <Dialog key={index} open={isOpen} onOpenChange={(value) => {
                            setStartTimeItems(generateTimeIntervals(slotSpace || SLOT_SKIP_INTERVAL, dateToTimeString(slot.startDate), dateToTimeString(slot.endDate)).map((v) => {
                                return { value: v, label: v }
                            }));
                            setIsOpen(value);
                        }}>
                            <DialogTrigger asChild>
                                <Button key={index} className={cn("border-2", "border-blue-500", "text-blue-500", "rounded-lg", "hover:bg-blue-500", "hover:text-white")}>
                                    {dateToTimeString(slot.startDate)} - {dateToTimeString(slot.endDate)}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 sm:max-w-[425px]">
                                <ApproveDialogContent closeDialogCallback={closeDialogCallback} startTimeItems={startTimeItems} mentorId={mentorId} />
                            </DialogContent>
                        </Dialog>
                    )
                }) : <div className="text-center">No slots available - If this is a mistake, please contact the mentor</div>}
            </div>
        </div >
    )
}

type ApproveDialogContentProps = {
    startTimeItems: { value: string, label: string }[];
    mentorId: string;
    closeDialogCallback: () => void;
}

const ApproveDialogContent = ({ startTimeItems, mentorId, closeDialogCallback }: ApproveDialogContentProps) => {
    const router = useRouter();

    const [reserveStart, setReserveStart] = useState<string>('');
    const [reserveMinutes, setReserveMinutes] = useState<number>(0);
    const [note, setNote] = useState<string>('');
    const [notifyState, setNotifyState] = useState<{ message: string; type: 'idle' | 'success' | 'error'; }>({
        message: '',
        type: 'idle'
    });

    const handleApproveSlot = async () => {
        if (!reserveStart || !reserveMinutes) return;

        const selectable_index = SELECTABLE_MINUTES.findIndex((v) => v === reserveMinutes);
        const reverse_start_index = startTimeItems.findIndex((v) => v.value === reserveStart);
        if (reverse_start_index === -1) {
            setNotifyState({ message: 'Invalid time selection', type: 'error' });
            return;
        }

        if (selectable_index === -1) {
            setNotifyState({ message: 'Invalid duration selection', type: 'error' });
            return;
        }

        if (!(reverse_start_index + selectable_index < startTimeItems.length - 1)) {
            setNotifyState({ message: 'Invalid time selection', type: 'error' });
            return;
        }

        const ret = await createMentorRequest({
            mentorId,
            start: reserveStart,
            duration: reserveMinutes,
            note,
        });

        if (ret.success) {
            setNotifyState({ message: 'Slot approved successfully', type: 'success' });
            closeDialogCallback();
            router.push('/board');
        } else {
            setNotifyState({ message: ret.message || 'Failed to approve slot', type: 'error' });
        }
    }

    return (
        <Fragment>
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
            <Label>Note</Label>
            <Textarea
                placeholder="Add a note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <DialogFooter>
                <div className="flex flex-row gap-2 justify-end">
                    <DialogClose asChild>
                        <Button className={cn("border", "border-red-500", "text-red-500", "rounded-lg", "hover:bg-red-500", "hover:text-white")}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleApproveSlot} className={cn("border", "border-blue-500", "text-blue-500", "rounded-lg", "hover:bg-blue-500", "hover:text-white")}>Approve</Button>
                </div>
                {notifyState.message && <div className={cn("text-white", "text-sm", "mt-2", notifyState.type === 'success' ? 'text-green-500' : 'text-red-500')}>{notifyState.message}</div>}
            </DialogFooter>
        </Fragment>
    )
}
