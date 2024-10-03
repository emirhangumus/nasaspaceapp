"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cancelMentorRequestByTeam } from "@/lib/serverActions/mentor";
import { getMentorRequestByTeam } from "@/lib/serverActions/slots";
import { AwaitedReturnType } from "@/lib/types";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";

export const MentorRequestCancelDialog = ({ mentorRequest }: { mentorRequest: AwaitedReturnType<typeof getMentorRequestByTeam> }) => {
    const [open, setOpen] = useState(false);

    const cancelRequest = async () => {
        if (!mentorRequest) return;
        await cancelMentorRequestByTeam(mentorRequest.id);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Cross2Icon className="w-6 h-6 text-red-500 absolute right-2 bottom-2" />
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 p-4">
                <DialogTitle>
                    Request Mentor Cancelation
                </DialogTitle>
                <DialogDescription>
                    Are you sure you want to cancel the mentor request?
                </DialogDescription>
                <DialogFooter>
                    <div>
                        <Button onClick={cancelRequest} variant={'destructive'}>Cancel Request</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}