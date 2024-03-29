import React from "react";

export let metadata = {
    title: "Farcaster",
    description: "",
};

function VercelLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-label="Vercel Logo"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 19"
            { ...props }
        >
            <path
                clipRule="evenodd"
                d="M12.04 2L2.082 18H22L12.04 2z"
                fill="#000"
                fillRule="evenodd"
                stroke="#000"
                strokeWidth="1.5"
            />
        </svg>
    );
}

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                <div className="flex justify-center items-center bg-black rounded-full w-16 sm:w-24 h-16 sm:h-24 my-8">
                    {/*<VercelLogo className="h-8 sm:h-16 invert p-3 mb-1"/>*/}
                </div>
                <h1 className="text-lg sm:text-2xl font-bold mb-2"></h1>
                <img src="/1-1.png" alt=""/>
            </main>
        </div>
    );
}
