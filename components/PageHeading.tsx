type PageHeadingProps = {
    title: string;
    subtitle: string;
}

export const PageHeading = ({ title, subtitle }: PageHeadingProps) => {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
        </div>
    );
}