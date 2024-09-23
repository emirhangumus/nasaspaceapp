"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { register } from "@/lib/serverActions/auth";
import { RoleName } from "@prisma/client";
import { useState } from "react";

type FormState = {
    status: "idle" | "loading" | "error" | "success";
    message: string;
}

type FormProps = {
    mode?: "init" | "admin"
}

export const Form = ({ mode = "init" }: FormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [state, setState] = useState<FormState>({
        status: "idle",
        message: "",
    });
    const [role, setRole] = useState<RoleName>("USER");

    const handleSubmit = async () => {
        setState({ status: "loading", message: "" });
        if (mode == 'init') {
            const ret = await register({ email, password, name, surname, role: "ADMIN" });
            if (ret.success) {
                setState({ status: "success", message: "Register successful. Redirecting..." });
                setTimeout(() => {
                    window.location.href = "/";
                }, 500)
            } else {
                setState({ status: "error", message: ret.message });
            }
        }
        if (mode == 'admin') {
            const ret = await register({ email, password, name, surname, role });
            if (ret.success) {
                setState({ status: "success", message: "User created successfully." });
                setEmail("");
                setPassword("");
                setName("");
                setSurname("");
                setRole("USER");
                setTimeout(() => {
                    setState({ status: "idle", message: "" });
                }, 2000);
            }
            else {
                setState({ status: "error", message: ret.message });
            }
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
            {mode === "admin" && (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as RoleName)} >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="MENTOR">Mentor</SelectItem>
                                <SelectItem value="USER">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
            <Button
                disabled={state.status === "loading" || state.status === "success"}
                type="submit" className="w-full" onClick={handleSubmit}>
                Register
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