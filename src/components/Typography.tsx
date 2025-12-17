interface HeadingProps {
    level: number;
    className?: string;
    children: React.ReactNode;
}

export default function Heading(props: HeadingProps) {
    const { level, className, children } = props;

    switch (level) {
        case 1:
            return <h1 className={"text-5xl font-extrabold mb-8" + " " + className}>{children}</h1>;
        case 2:
            return <h2 className={"text-4xl font-bold mb-4" + " " + className}>{children}</h2>;
        case 3:
            return <h3 className={"text-3xl font-bold" + " " + className}>{children}</h3>;
        case 4:
            return <h4 className={"text-2xl font-bold" + " " + className}>{children}</h4>;
        case 5:
            return <h5 className={"text-xl font-bold" + " " + className}>{children}</h5>;
        default:
            return <h6 className={"text-lg font-bold" + " " + className}>{children}</h6>;
    }
}