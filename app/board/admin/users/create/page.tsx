import { Form as RegisterForm } from "@/components/forms/InitForm/Form";
import { PageHeading } from "@/components/PageHeading";

export default async function Page() {
    return (
        <div>
            <PageHeading title="Create User" subtitle="In this page, you can create a new user." />
            <RegisterForm mode="admin" />
        </div>
    )
}