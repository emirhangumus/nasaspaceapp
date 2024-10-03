import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Form } from "./Form"
import Image from "next/image"

export function LoginForm() {
    return (
        <Card className="mx-auto max-w-sm border-none p-0">
            <Image
                src="/logo.png"
                alt="Logo"
                width={200}
                height={200}
                className="mx-auto"
            />
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form />
            </CardContent>
        </Card>
    )
}
