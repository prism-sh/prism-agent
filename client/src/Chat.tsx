import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import "./App.css";
import sendIcon from "./assets/send_icon.png"
import { BackgroundGradient } from "./components/ui/backgroundGradient";
import { NavbarAgentCard } from "./components/ui/NavbarAgentCard.tsx";

type TextResponse = {
    text: string;
    user: string;
};

export default function Chat() {
    const { agentId } = useParams();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<TextResponse[]>([]);
    const messagesEndRef = useRef<null | HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            const res = await fetch(`/api/${agentId}/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text,
                    userId: "user",
                    roomId: `default-room-${agentId}`,
                }),
            });
            return res.json() as Promise<TextResponse[]>;
        },
        onSuccess: (data) => {
            setMessages((prev) => [...prev, ...data]);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message immediately to state
        const userMessage: TextResponse = {
            text: input,
            user: "user",
        };
        setMessages((prev) => [...prev, userMessage]);

        mutation.mutate(input);
        setInput("");
    };


    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    return (
        <div className={`${messages.length <= 0 ? "justify-center" : ""} flex flex-col h-screen max-h-screen w-full py-10`}>
            <BackgroundGradient/>
            <NavbarAgentCard isAbsolute={messages.length <= 0}/>

            <div className={`${messages.length > 0 ? "flex-1" : ""} min-h-0 overflow-y-auto p-4 z-10`}>
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.length > 0 ? (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    message.user === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-[10px] px-4 py-2 ${
                                        message.user === "user"
                                            ? "bg-[#162332D4] text-right"
                                            : "bg-[#173E6A70] text-left"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>
                            <span className="font-bold text-3xl">What Can I help with?</span>
                        </div>
                    )}
                </div>

                {mutation.isPending && (
                    <div className="flex justify-center mt-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-100 mt-3e"></div>
                    </div>
                )}

                <div ref={messagesEndRef}></div>
            </div>

            <div className="px-10 pt-4">

                <form onSubmit={handleSubmit} className={`${messages.length > 0 ? "max-w-4xl" : "max-w-2xl"} flex gap-2 items-center mx-auto relative`}>
                    <Input
                        autoFocus={true}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message"
                    />
                    <button className="absolute right-[20px]" type="submit" disabled={mutation.isPending}>
                        <img width={"22px"} src={sendIcon} className={(mutation.isPending ? "opacity-50" : "opacity-100")}></img>
                    </button>
                </form>
{/* tryin */}
            </div>
        </div>
    );
}
