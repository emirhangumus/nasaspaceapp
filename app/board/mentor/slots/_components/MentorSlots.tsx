"use client";

import { PageHeading } from "@/components/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { SLOT_SKIP_INTERVAL } from "@/lib/contants";
import { cancelMentorRequest, getMentorBy, markAsDoneMentorRequest, TMentorSlots } from "@/lib/serverActions/mentor";
import { createNewSlot, deleteSlotWithRange } from "@/lib/serverActions/slots";
import type { AwaitedReturnType } from "@/lib/types";
import { dateToTimeString, generateDayTimes } from "@/lib/utils";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { MoreHorizontalIcon } from "lucide-react";
import { useEffect, useState } from "react";

type MentorSlotsProps = {
    mentor: AwaitedReturnType<typeof getMentorBy>;
    slots: TMentorSlots;
};

const dayTimes = generateDayTimes(SLOT_SKIP_INTERVAL);

const startItems = dayTimes.map((time) => ({
    value: time,
    label: time,
}));

export const MentorSlots = ({ slots }: MentorSlotsProps) => {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <CreateNewSlot />
            </div>
            <hr />
            <div>
                <ManageExistingSlots slots={slots} />
            </div>
        </div>
    )
}

const CreateNewSlot = () => {
    const { toast } = useToast();
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
            setEndDate('');
        }
    }, [startDate]);

    useEffect(() => {
        if (startDate && endDate) {
            setReady(true);
        }
    }, [startDate, endDate]);

    const handleCreateSlot = async () => {
        const ret = await createNewSlot({ start: startDate, end: endDate });
        if (ret.success) {
            setStartDate('');
            setEndDate('');
            setReady(false);
        }
        toast({
            title: ret.success ? 'Slot created.' : 'Error',
            description: ret.message,
            variant: ret.success ? 'default' : 'destructive',
        })
    }

    return (
        <>
            <PageHeading title="Mentor Slots" subtitle="Create and manage your slots. Slots are daily time slots when you are available for mentoring." />
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <Combobox value={startDate} items={startItems} onSelect={(value) => setStartDate(value)} noItemsMessage="No slots available" placeholder="Select start time" searchPlaceholder="Search start time" />
                    <Combobox value={endDate} items={endItems} onSelect={(value) => setEndDate(value)} noItemsMessage="Select start first." placeholder="Select end time" searchPlaceholder="Search end time" />
                </div>
                <Button disabled={!ready} onClick={handleCreateSlot}>Create Slot</Button>
            </div>
        </>
    )
}

const ManageExistingSlots = ({ slots }: { slots: MentorSlotsProps['slots'] }) => {

    const { toast } = useToast();


    const deleteSlotHandler = async (start: Date, end: Date) => {
        const ret = await deleteSlotWithRange(start, end);
        if (ret.success) {
            toast({
                title: 'Slot deleted.',
                description: '',
                variant: 'default',
            })
        } else {
            toast({
                title: 'Error',
                description: ret.message,
                variant: 'destructive',
            })
        }
    }

    const cancelSlotHandler = async (requestId: number) => {
        const ret = await cancelMentorRequest(requestId);
        if (ret.success) {
            toast({
                title: 'Slot request canceled.',
                description: '',
                variant: 'default',
            })
        } else {
            toast({
                title: 'Error',
                description: ret.message,
                variant: 'destructive',
            })
        }
    }

    const markAsDoneSlotHandler = async (requestId: number) => {
        const ret = await markAsDoneMentorRequest(requestId);
        if (ret.success) {
            toast({
                title: 'Slot request marked as done.',
                description: '',
                variant: 'default',
            })
        } else {
            toast({
                title: 'Error',
                description: ret.message,
                variant: 'destructive',
            })
        }
    }

    return (
        <div>
            <PageHeading title="Manage Slots" subtitle="Here are your opened slots. You can close them at any time." />
            {/* <pre>{JSON.stringify(slots, null, 2)}</pre> */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Empty Slots</h2>
                    <ul className="grid grid-cols-2 gap-4">
                        {slots.EMPTY.length > 0 ? slots.EMPTY.map((slot, i) => (
                            <li key={i} className="bg-blue-900 px-4 py-0.5 border-2 border-blue-700 rounded-lg flex justify-between items-center">
                                <span>{dateToTimeString(slot.startTime)}</span>
                                <span>
                                    -
                                </span>
                                <span>{dateToTimeString(slot.endTime)}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-6 w-6 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontalIcon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={async () => await deleteSlotHandler(slot.startTime, slot.endTime)}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                        )) : <li className="text-gray-500">No empty slots</li>}
                    </ul>
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Pending Slots</h2>
                    <ul className="grid grid-cols-1 gap-4">
                        {slots.PENDING.length > 0 ? slots.PENDING.map((slot, i) => (
                            <li key={i} className="bg-yellow-900 px-4 py-0.5 border-2 border-yellow-700 rounded-lg flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                    <span>{dateToTimeString(slot.startTime)}</span>
                                    <span>
                                        -
                                    </span>
                                    <span>{dateToTimeString(slot.endTime)}</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="h-6 w-6 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <InfoCircledIcon className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-zinc-950 sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Team Info</DialogTitle>
                                                <DialogDescription>
                                                    You can see the team info here.
                                                </DialogDescription>
                                                <div className="flex flex-col items-start py-4">
                                                    <Badge variant="outline">
                                                        {slot.team.id}
                                                    </Badge>
                                                    <span className="text-3xl font-bold">{slot.team.name}</span>
                                                </div>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-6 w-6 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontalIcon className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={async () => await cancelSlotHandler(slot.id)}>
                                                Cancel Request
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={async () => await markAsDoneSlotHandler(slot.id)}>
                                                Mark as Done
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </li>
                        )) : <li className="text-gray-500">No pending slots</li>}
                    </ul>
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Canceled Slots</h2>
                    <ul className="grid grid-cols-2 gap-4">
                        {slots.CANCELED.length > 0 ? slots.CANCELED.map((slot, i) => (
                            <li key={i} className="bg-red-900 px-4 py-0.5 border-2 border-red-700 rounded-lg flex justify-between items-center">
                                <span>{dateToTimeString(slot.startTime)}</span>
                                <span>
                                    -
                                </span>
                                <span>{dateToTimeString(slot.endTime)}</span>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" className="h-6 w-6 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <InfoCircledIcon className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-950 sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Team Info</DialogTitle>
                                            <DialogDescription>
                                                You can see the team info here.
                                            </DialogDescription>
                                            <div className="flex flex-col items-start py-4">
                                                <Badge variant="outline">
                                                    {slot.team.id}
                                                </Badge>
                                                <span className="text-3xl font-bold">{slot.team.name}</span>
                                            </div>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </li>
                        )) : <li className="text-gray-500">No rejected slots</li>}
                    </ul>
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Done Slots</h2>
                    <ul className="grid grid-cols-2 gap-4">
                        {slots.DONE.length > 0 ? slots.DONE.map((slot, i) => (
                            <li key={i} className="bg-green-900 px-4 py-0.5 border-2 border-green-700 rounded-lg flex justify-between items-center">
                                <span>{dateToTimeString(slot.startTime)}</span>
                                <span>
                                    -
                                </span>
                                <span>{dateToTimeString(slot.endTime)}</span>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" className="h-6 w-6 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <InfoCircledIcon className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-950 sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Team Info</DialogTitle>
                                            <DialogDescription>
                                                You can see the team info here.
                                            </DialogDescription>
                                            <div className="flex flex-col items-start py-4">
                                                <Badge variant="outline">
                                                    {slot.team.id}
                                                </Badge>
                                                <span className="text-3xl font-bold">{slot.team.name}</span>
                                            </div>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </li>
                        )) : <li className="text-gray-500">No done slots</li>}
                    </ul>
                </div>
            </div>
        </div>
    )
}