"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement } from "@/lib/serverActions/announcement";
import { useState } from "react";

type FormState = {
    status: "idle" | "loading" | "error" | "success";
    message: string;
}

export const AnnouncementCreateForm = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [state, setState] = useState<FormState>({
        status: "idle",
        message: "",
    });

    const handleSubmit = async () => {
        setState({ status: "loading", message: "" });

        const ret = await createAnnouncement({ content, title });

        if (ret.success) {
            setState({ status: "success", message: ret.message });
            // setName("");
        } else {
            setState({ status: "error", message: ret.message });
        }
    };

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Title</Label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    id="name"
                    type="text"
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    id="content"
                    required
                    rows={8}
                />
            </div>
            <Button
                disabled={state.status === "loading" || state.status === "success"}
                type="submit" className="w-full" onClick={handleSubmit}>
                Create Announcement
            </Button>
            {state.status === "error" && (
                <div className="text-red-500">{state.message}</div>
            )}
            {state.status === "success" && (
                <div className="text-green-500">{state.message}</div>
            )}
        </div>
    )

}