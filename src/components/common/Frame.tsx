interface FrameProps {
    className?: string;
    children: React.ReactNode;
}

export default function Frame(props: FrameProps) {
    const { className, children } = props;

    return (
        <div
            className={"shadow-md p-4 border border-gray-300 " + className}
        >
            {children}
        </div>
    );
}
