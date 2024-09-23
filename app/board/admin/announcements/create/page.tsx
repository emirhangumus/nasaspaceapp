import { AnnouncementCreateForm } from "@/components/forms/AnnouncementForm";
import { PageHeading } from "@/components/PageHeading";

export default async function Page() {

    return (
        <div>
            <PageHeading title="Create Announcement" subtitle="In this page, you can create a new announcement." />
            <AnnouncementCreateForm />
        </div>
    )
}