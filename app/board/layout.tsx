export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="container mx-auto p-8">
            {children}
        </div>
    );
}
