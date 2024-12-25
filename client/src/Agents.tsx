import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { BackgroundGradient } from "./components/ui/backgroundGradient";

type Agent = {
    id: string;
    name: string;
};

function Agents() {
    const navigate = useNavigate();
    const { data: agents, isLoading } = useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const res = await fetch("/api/agents");
            const data = await res.json();
            return data.agents as Agent[];
        },
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <BackgroundGradient/>

            <h1 className="text-2xl font-bold mb-8">Select your agent:</h1>

            {isLoading ? (
                <div>Loading agents...</div>
            ) : (
                <div className="grid gap-4 w-full max-w-md">
                    {agents?.map((agent) => (
                        <button
                            key={agent.id}
                            className="bg-primary text-primary-foreground shadow hover:bg-primary/90 px-4 py-2 w-full text-lg py-3 rounded-lg font-semibold"
                            onClick={() => {
                                navigate(`/${agent.id}`);
                            }}
                        >
                            {agent.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Agents;
