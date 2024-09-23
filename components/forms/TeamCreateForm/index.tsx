"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeam } from "@/lib/serverActions/team";
import { useState } from "react";

type FormState = {
    status: "idle" | "loading" | "error" | "success";
    message: string;
}

export const TeamCreateForm = () => {
    const [name, setName] = useState("");
    const [state, setState] = useState<FormState>({
        status: "idle",
        message: "",
    });

    const handleSubmit = async () => {
        setState({ status: "loading", message: "" });

        const ret = await createTeam({ name });

        if (ret.success) {
            setState({ status: "success", message: ret.message });
            setName("");
        } else {
            setState({ status: "error", message: ret.message });
        }
    };

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="name"
                    type="text"
                    required
                />
            </div>
            <Button
                disabled={state.status === "loading" || state.status === "success"}
                type="submit" className="w-full" onClick={handleSubmit}>
                Create Team
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