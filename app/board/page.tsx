import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAnnouncements } from "@/lib/serverActions/announcement";
import { getCurrentUser, getCurrentUserRole } from "@/lib/serverActions/auth";
import { getMentorBy } from "@/lib/serverActions/mentor";
import { getAllProfessions } from "@/lib/serverActions/professions";
import { getMentorRequestByTeam } from "@/lib/serverActions/slots";
import { getTeam, TeamData } from "@/lib/serverActions/team";
import { AwaitedReturnType, NASAJWTPayload } from "@/lib/types";
import { dateToTimeString } from "@/lib/utils";
import { Users2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PushNotificationManager } from "./_components/pushnotifi";
import { MentorRequestCancelDialog } from "./_components/user/MentorRequestCancelDialog";
import { NeedHelpCard } from "./_components/user/NeedHelp";
import prisma from "@/lib/db/prisma";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Board",
}

export default async function Board() {
    const role = await getCurrentUserRole();

    if (!role.success) redirect("/");

    if (role.data === "ADMIN") {
        return <AdminBoard />;
    }

    if (role.data === "USER") {
        return <UserBoard />;
    }

    if (role.data === "MENTOR") {
        return <MentorBoard />;
    }

    return null;
}

async function MentorBoard() {
    const user = await getCurrentUser();
    if (!user.success || !user.data?.id) redirect("/");
    const mentor = await getMentorBy('id', user.data.id);
    if (!mentor) redirect("/");
    const isSubscribed = await isSub(user.data.id);

    return (
        <div>
            <div className="flex flex-col gap-8">
                <MentorProfile mentor={mentor} />
                <Announcements />
                <PushNotificationManager userId={user.data.id} isSub={isSubscribed ? true : false} />
            </div>
        </div>
    )
}

function MentorProfile({ mentor }: { mentor: any }) {
    return (
        <div>
            <h2 className="text-3xl font-bold font-mono border-b border-blue-300 pb-2">Mentor Profile</h2>
            <div className="flex gap-4 font-mono my-4">
                <div className="w-24 h-24 relative">
                    <Image src={mentor.photo || "/nasa.png"} alt="NASA Logo" className="object-cover rounded-full" fill />
                </div>
                <div className="flex flex-col py-4">
                    <span className="text-2xl font-bold">{mentor.name} {mentor.surname}</span>
                    <div className="flex flex-col gap-2">
                        {/* {mentor.professions.map((profession) => (
                            <span key={profession.id} className="text-xs">
                                {profession.name}
                            </span>
                        ))} */}
                    </div>
                </div>
            </div>
            <Button asChild>
                <Link href={`/board/mentor/slots`}>
                    Manage Slots
                </Link>
            </Button>
        </div>
    )
}

async function UserBoard() {
    const user = await getCurrentUser();
    if (!user.success || !user.data?.teamId) redirect("/?error=team-not-found");
    const d = await getTeam(user.data.teamId);
    if (!d) redirect("/?error=team-not-found");
    const professions = await getAllProfessions();
    const currentMentorRequest = await getMentorRequestByTeam(d.id);
    const isSubscribed = await isSub(user.data.id);

    return (
        <div>
            <div className="flex flex-col gap-8">
                <TeamCard team={d} user={user.data} />
                <Announcements />
                <TeamMentorRequest mentorRequest={currentMentorRequest} />
                <NeedHelpCard professions={professions} />
                <PushNotificationManager userId={user.data.id} isSub={isSubscribed ? true : false} />
            </div>
        </div>
    )
}

function TeamMentorRequest({ mentorRequest }: { mentorRequest: AwaitedReturnType<typeof getMentorRequestByTeam> }) {

    return (
        <div>
            <h2 className="text-3xl font-bold font-mono border-b border-blue-300 pb-2 mb-4">Mentor Request</h2>
            {mentorRequest ? (
                <div className="shadow-inner shadow-blue-400 border-x-2 border-t-2 last:border-b-2 rounded-xl border-blue-700 p-4 bg-gradient-to-br from-transparent from-60% to-blue-800 relative">
                    <h3 className="text-2xl font-bold font-mono">
                        Mentor Request
                    </h3>
                    <div className="py-4 font-mono">
                        <div className="flex flex-row justify-between items-center">
                            <Badge>{dateToTimeString(new Date(mentorRequest.startTime))} - {dateToTimeString(new Date(mentorRequest.endTime))}</Badge>
                            <MentorRequestCancelDialog mentorRequest={mentorRequest} />
                        </div>
                        <div className="flex flex-col mt-2">
                            <span className="font-bold text-4xl font-mono">{mentorRequest.user.name}</span>
                            <span className="font-bold text-lg font-mono">{mentorRequest.user.surname}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="shadow-inner shadow-blue-400 border-x-2 border-t-2 last:border-b-2 rounded-xl border-blue-700 p-4 bg-gradient-to-br from-transparent from-60% to-blue-800">
                    <h3 className="text-2xl font-bold font-mono">
                        No Mentor Request
                    </h3>
                    <div className="py-4">
                        <p>
                            You can request a mentor to help you with your project.
                        </p>
                    </div>
                </div>
            )
            }
        </div >
    )
}


function TeamCard({ team, user }: { team: TeamData | null, user: NASAJWTPayload }) {

    if (!team) {
        return (
            <div className="rounded-xl from-blue-600 to-blue-700 bg-gradient-to-tr shadow-inner shadow-blue-300 border-zinc-200 min-h-[600px] overflow-hidden">
                <div className="grid grid-cols-6 border-b border-blue-300 px-8">
                    <div className="border-r border-blue-300 col-span-4 min-h-24 flex items-end pt-16">
                        <div className="flex flex-col justify-end">
                            <span className="text-xs mb-1"><Badge variant={'outline'} className="border-white">0</Badge></span>
                            <span className="text-3xl font-bold mb-4 font-mono">No Team</span>
                        </div>
                    </div>
                    <div className="col-span-2 flex items-end justify-center px-4 pb-4">
                        <Image src="/nasa.png" width={100} height={100} alt="NASA Logo" />
                    </div>
                </div>
                <div className="flex flex-col px-8 py-16 gap-2 border-b border-blue-300 font-mono">
                    <span className="text-5xl font-bold">{user.name.toUpperCase()}</span>
                    <span className="text-5xl font-bold">{user.surname.toUpperCase()}</span>
                </div>
            </div>
        )
    };

    return (
        <div className="rounded-xl from-blue-600 to-blue-700 bg-gradient-to-tr shadow-inner shadow-blue-300 border-zinc-200 overflow-hidden">
            <div className="grid grid-cols-6 border-b border-blue-300 px-8">
                <div className="border-r border-blue-300 col-span-4 min-h-24 flex items-end pt-16">
                    <div className="flex flex-col justify-end">
                        <span className="text-xs mb-1"><Badge variant={'outline'} className="border-white">{team.id}</Badge></span>
                        <span className="text-3xl font-bold mb-4 font-mono">{team.name}</span>
                    </div>
                </div>
                <div className="col-span-2 flex items-end justify-center px-4 pb-4">
                    <Image src="/nasa.png" width={100} height={100} alt="NASA Logo" />
                </div>
            </div>
            <div className="flex flex-col px-8 py-16 gap-2 border-b border-blue-300 font-mono">
                <span className="text-5xl font-bold">{user.name.toUpperCase()}</span>
                <span className="text-5xl font-bold">{user.surname.toUpperCase()}</span>
            </div>
            <div className="font-mono">
                <div className="flex flex-col gap-4 px-8 py-4">
                    <h3 className="text-xl font-bold font-mono underline">Mentor</h3>
                    <div className="flex flex-row gap-4 items-center">
                        <Image src="/nasa.png" width={50} height={50} alt="NASA Logo" />
                        <span>{team.mentor ? <Link href={`/board/user/${team.mentor.id}`}>{team.mentor.name} {team.mentor.surname}</Link> : "No mentor"}</span>
                    </div>
                </div>
                <div className="flex justify-between items-end px-8 py-4">
                    <p className="text-xs">NASA Space Apps Challenge</p>
                    <TeamMembers team={team} />
                </div>
            </div>
        </div>
    );
}

function TeamMembers({ team }: { team: TeamData }) {
    return (
        <Dialog>
            <DialogTrigger>
                <Users2Icon size={24} />
            </DialogTrigger>
            <DialogContent className="bg-blue-700 border-blue-300 border-t-2 border-b-2">
                <DialogHeader>
                    <DialogTitle>
                        Team Members
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-8">
                    {team.users.map((user) => (
                        <div key={user.id} className="flex flex-row gap-4 items-center">
                            <Image src="/nasa.png" width={50} height={50} alt="NASA Logo" />
                            <span>{user.name} {user.surname}</span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}


function AdminBoard() {
    return (
        <div className="grid grid-cols-2 gap-8">
            <Button asChild>
                <Link href="/board/admin/teams/create">
                    Create Team
                </Link>
            </Button>
            <Button asChild>
                <Link href="/board/admin/users/create">
                    Create User
                </Link>
            </Button>
            <Button asChild>
                <Link href="/board/admin/announcements/create">
                    Create Announcement
                </Link>
            </Button>
        </div>
    )
}

async function Announcements() {
    const announcements = await getAnnouncements();

    return (
        <div>
            <h2 className="text-3xl font-bold font-mono border-b border-blue-300 pb-2 mb-4">Announcements</h2>
            <div className="grid">
                {announcements.data.length > 0 ? announcements.data.map((announcement) => (
                    <div key={announcement.id} className="shadow-inner shadow-blue-400 border-x-2 border-t-2 last:border-b-2 first:rounded-t-xl last:rounded-b-xl border-blue-700 p-4 bg-gradient-to-br from-transparent from-60% to-blue-800">
                        <h3 className="text-2xl font-bold font-mono">{announcement.title}</h3>
                        <div className="py-4">
                            <p>{announcement.content}</p>
                        </div>
                        <div className="flex flex-row justify-end items-center">
                            <span className="text-xs font-mono">{new Date(announcement.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                )) : (
                    <div className="shadow-inner shadow-blue-400 border-x-2 border-t-2 last:border-b-2 first:rounded-t-xl last:rounded-b-xl border-blue-700 p-4 bg-gradient-to-br from-transparent from-60% to-blue-800">
                        <h3 className="text-2xl font-bold font-mono">No Announcements</h3>
                        <div className="py-4">
                            <p>
                                There are no announcements at the moment.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const isSub = async (userId: string) => {
    return await prisma.notificationSubs.findFirst({
        where: {
            userId
        }
    })
}