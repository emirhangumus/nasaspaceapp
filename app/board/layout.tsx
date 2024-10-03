import { Header } from "@/components/header";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="container mx-auto p-4">
            <Header />
            {children}
        </div>
    );
}
