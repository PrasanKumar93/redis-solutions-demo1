import { FormEvent, useState } from "react";

function AIMessage({ message }: { message: string; }) {
    return (
        <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1"><span
            className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
            <div className="rounded-full bg-gray-100 border p-1">
                <svg width="20px" height="20px" viewBox="0 -18 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"><path d="M245.97 168.943c-13.662 7.121-84.434 36.22-99.501 44.075-15.067 7.856-23.437 7.78-35.34 2.09-11.902-5.69-87.216-36.112-100.783-42.597C3.566 169.271 0 166.535 0 163.951v-25.876s98.05-21.345 113.879-27.024c15.828-5.679 21.32-5.884 34.79-.95 13.472 4.936 94.018 19.468 107.331 24.344l-.006 25.51c.002 2.558-3.07 5.364-10.024 8.988" fill="#912626" /><path d="M245.965 143.22c-13.661 7.118-84.431 36.218-99.498 44.072-15.066 7.857-23.436 7.78-35.338 2.09-11.903-5.686-87.214-36.113-100.78-42.594-13.566-6.485-13.85-10.948-.524-16.166 13.326-5.22 88.224-34.605 104.055-40.284 15.828-5.677 21.319-5.884 34.789-.948 13.471 4.934 83.819 32.935 97.13 37.81 13.316 4.881 13.827 8.9.166 16.02" fill="#C6302B" /><path d="M245.97 127.074c-13.662 7.122-84.434 36.22-99.501 44.078-15.067 7.853-23.437 7.777-35.34 2.087-11.903-5.687-87.216-36.112-100.783-42.597C3.566 127.402 0 124.67 0 122.085V96.206s98.05-21.344 113.879-27.023c15.828-5.679 21.32-5.885 34.79-.95C162.142 73.168 242.688 87.697 256 92.574l-.006 25.513c.002 2.557-3.07 5.363-10.024 8.987" fill="#912626" /><path d="M245.965 101.351c-13.661 7.12-84.431 36.218-99.498 44.075-15.066 7.854-23.436 7.777-35.338 2.087-11.903-5.686-87.214-36.112-100.78-42.594-13.566-6.483-13.85-10.947-.524-16.167C23.151 83.535 98.05 54.148 113.88 48.47c15.828-5.678 21.319-5.884 34.789-.949 13.471 4.934 83.819 32.933 97.13 37.81 13.316 4.88 13.827 8.9.166 16.02" fill="#C6302B" /><path d="M245.97 83.653c-13.662 7.12-84.434 36.22-99.501 44.078-15.067 7.854-23.437 7.777-35.34 2.087-11.903-5.687-87.216-36.113-100.783-42.595C3.566 83.98 0 81.247 0 78.665v-25.88s98.05-21.343 113.879-27.021c15.828-5.68 21.32-5.884 34.79-.95C162.142 29.749 242.688 44.278 256 49.155l-.006 25.512c.002 2.555-3.07 5.361-10.024 8.986" fill="#912626" /><path d="M245.965 57.93c-13.661 7.12-84.431 36.22-99.498 44.074-15.066 7.854-23.436 7.777-35.338 2.09C99.227 98.404 23.915 67.98 10.35 61.497-3.217 55.015-3.5 50.55 9.825 45.331 23.151 40.113 98.05 10.73 113.88 5.05c15.828-5.679 21.319-5.883 34.789-.948 13.471 4.935 83.819 32.934 97.13 37.811 13.316 4.876 13.827 8.897.166 16.017" fill="#C6302B" /><path d="M159.283 32.757l-22.01 2.285-4.927 11.856-7.958-13.23-25.415-2.284 18.964-6.839-5.69-10.498 17.755 6.944 16.738-5.48-4.524 10.855 17.067 6.391M131.032 90.275L89.955 73.238l58.86-9.035-17.783 26.072M74.082 39.347c17.375 0 31.46 5.46 31.46 12.194 0 6.736-14.085 12.195-31.46 12.195s-31.46-5.46-31.46-12.195c0-6.734 14.085-12.194 31.46-12.194" fill="#FFF" /><path d="M185.295 35.998l34.836 13.766-34.806 13.753-.03-27.52" fill="#621B1C" /><path d="M146.755 51.243l38.54-15.245.03 27.519-3.779 1.478-34.791-13.752" fill="#9A2928" /></svg>
            </div>
        </span>
            <p className="leading-relaxed"><span className="block font-bold text-gray-700">Assistant </span>
                {message}
            </p>
        </div>
    )
}

function UserMessage({ message }: { message: string; }) {
    return (
        <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1"><span
            className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
            <div className="rounded-full bg-gray-100 border p-1"><svg stroke="none" fill="black" strokeWidth="0"
                viewBox="0 0 16 16" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z">
                </path>
            </svg></div>
        </span>
            <p className="leading-relaxed"><span className="block font-bold text-gray-700">You </span>{message}</p>
        </div>
    );
}

async function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default function Chat({ refreshProducts }: { refreshProducts?: (search: string) => Promise<void>; }) {
    const [showChat, setShowChat] = useState(false);
    const [loading, setLoading] = useState(false);
    let [chats, setChats] = useState<{ type: 'AI' | 'User', message: string; }[]>([
        { type: 'AI', message: 'How can I help you today?' }
    ]);

    async function onSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        const form = ev.target as HTMLFormElement;
        const data = new FormData(form);
        const question = data.get('question');
        form.reset();

        if (!question || typeof question !== 'string') {
            return;
        }

        chats = chats.concat({ type: 'User', message: question });
        setChats(chats);
        setLoading(true);
        if (!!refreshProducts) {
            await refreshProducts(question);
            chats = chats.concat({ type: 'AI', message: "Excellent! I've curated some products that should help you find what you're looking for." });
            setChats(chats);
        }
        setLoading(false);
    }

    return <>
        <button
            onClick={() => { setShowChat(!showChat); }}
            className="fixed bottom-4 right-20 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border rounded-full w-12 h-12 bg-black hover:bg-gray-700 m-0 cursor-pointer border-gray-200 bg-[#a51f1c] p-0 normal-case leading-5 hover:text-gray-900"
            type="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed">
            <svg xmlns=" http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-white block border-gray-200 align-middle">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" className="border-gray-200">
                </path>
            </svg>
        </button>
        {showChat && (
            <div style={{ boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                className="fixed bottom-[calc(4rem+1.5rem)] right-20 mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-[440px] h-[634px]">

                <div className="flex flex-col space-y-1.5 pb-6">
                    <h2 className="font-semibold text-lg tracking-tight">Shopping Assistant</h2>
                    <p className="text-sm text-[#6b7280] leading-3">Powered by Redis</p>
                </div>

                <div className="pr-4 h-[474px]" style={{ minWidth: "100%", display: "table" }}>
                    {chats.map((chat, index) => {
                        if (chat.type === 'AI') {
                            return <AIMessage key={`AI-${index}`} message={chat.message} />
                        }

                        return <UserMessage key={`User-${index}`} message={chat.message} />
                    })}
                    {loading && <AIMessage message="..." />}
                </div>

                <div className="flex items-center pt-0">
                    <form onSubmit={onSubmit} className="flex items-center justify-center w-full space-x-2">
                        <input
                            name="question"
                            autoComplete="off"
                            className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
                            placeholder="Ask your question" />
                        <button
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-[#a51f1c] hover:bg-[#111827E6] h-10 px-4 py-2">
                            Send</button>
                    </form>
                </div>

            </div>
        )}
    </>
}