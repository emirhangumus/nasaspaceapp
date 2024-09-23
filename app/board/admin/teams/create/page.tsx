import { TeamCreateForm } from "@/components/forms/TeamCreateForm";
import { PageHeading } from "@/components/PageHeading";

export default async function Page() {
    return (
        <div>
            <PageHeading title="Create User" subtitle="In this page, you can create a new user." />
            <TeamCreateForm />
        </div>
    )
}