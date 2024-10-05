"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/serverActions/auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type FormState = {
    status: "idle" | "loading" | "error" | "success";
    message: string;
}

export const Form = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [state, setState] = useState<FormState>({
        status: "idle",
        message: "",
    });
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const err = searchParams.get("error");

    useEffect(() => {
        console.log(err);
        if (err && err == 'team-not-found') {
            setTimeout(() => {
                toast({
                    title: "Error",
                    description: "Team not found. Please contact with a mentor.",
                    variant: 'destructive'
                });
            }, 0);
        }
    }, [err, toast]);

    const handleSubmit = async () => {
        setState({ status: "loading", message: "" });
        const ret = await login({ email, password });
        if (ret.success) {
            setState({ status: "success", message: "Login successful. Redirecting..." });
            setTimeout(() => {
                window.location.href = "/board";
            }, 500)
        } else {
            setState({ status: "error", message: ret.message });
        }
    };

    return (
        <form className="grid gap-4" onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
        }}>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                </div>
                <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password" type="password" required />
            </div>
            <Button
                disabled={state.status === "loading" || state.status === "success"}
                type="submit" className="w-full" onClick={handleSubmit}>
                Login
            </Button>
            {state.status === "error" && (
                <div className="text-red-500">{state.message}</div>
            )}
            {state.status === "success" && (
                <div className="text-green-500">{state.message}</div>
            )}
        </form>
    )

}