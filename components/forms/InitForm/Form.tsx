"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/serverActions/auth";
import { useState } from "react";

type FormState = {
    status: "idle" | "loading" | "error" | "success";
    message: string;
}

export const Form = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [state, setState] = useState<FormState>({
        status: "idle",
        message: "",
    });

    const handleSubmit = async () => {
        setState({ status: "loading", message: "" });
        const ret = await register({ email, password, name, surname, role: "ADMIN" });
        if (ret.success) {
            setState({ status: "success", message: "Register successful. Redirecting..." });
            setTimeout(() => {
                window.location.href = "/";
            }, 500)
        } else {
            setState({ status: "error", message: ret.message });
        }
    };

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="John"
                    required
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="surname">Surname</Label>
                <Input
                    id="surname"
                    type="text"
                    placeholder="Doe"
                    required
                    onChange={(e) => setSurname(e.target.value)}
                    value={surname}
                />
            </div>
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
        </div>
    )

}