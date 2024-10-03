"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const Header = () => {
    const path = usePathname();

    if (path === "/board") return (
        <Logo className="mb-4 ml-auto" />
    );

    return (

        // back button
        <div className="flex items-center gap-4 mb-8 font-mono">
            <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center h-6 w-6"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
            </button>
            <span className="text-base font-bold">NASA Space Apps Challenge</span>
            <Logo className="mb-4 ml-auto h-8 w-8" />
        </div>
    );
}

const Logo = ({ className }: { className?: string }) => {
    return (<Image
        src="/logo.png"
        alt="Logo"
        width={64}
        height={64}
        className={cn(className)}
    />)
};