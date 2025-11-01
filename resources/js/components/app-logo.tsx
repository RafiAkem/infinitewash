export default function AppLogo() {
    return (
        <>
            <div className="flex items-center justify-center">
                <img
                    src="/infinitewash-trans.png"
                    alt="InfiniteWash Logo"
                    className="h-8 w-auto"
                />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    InfiniteWash
                </span>
            </div>
        </>
    );
}
