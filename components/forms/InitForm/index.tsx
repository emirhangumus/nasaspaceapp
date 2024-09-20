import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Form } from "./Form"

export function InitForm() {
    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">
                    Create first user
                </CardTitle>
                <CardDescription>
                    Enter your email below to create the first user. The user will be an admin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form />
            </CardContent>
        </Card>
    )
}
