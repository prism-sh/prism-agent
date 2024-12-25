import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import logoImage from "../assets/prism_logo.png"
import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/ui/button";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarBackButton,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
    {
        title: "Chat",
        url: "chat",
    },
    {
        title: "Character Overview",
        url: "character",
    },
    {
        title: "View Logs",
        url: ""
    }
];
// typeshit
export function AppSidebar() {
    const { agentId } = useParams();
    const location = useLocation();
    const [selectedNavbarItemUrl, setSelectedNavbarItemUrl] = useState("") ;
    const navigate = useNavigate();

    useEffect(() => {
        if(location) {
            let lastRoute = location.pathname.slice(location.pathname.lastIndexOf("/") + 1 , location.pathname.length);
            setSelectedNavbarItemUrl(lastRoute) ;
        }
    }, [location])

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <img src={logoImage} />
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <PrimaryButton isActive={selectedNavbarItemUrl == item.url}>
                                        <a href={`/${agentId}/${item.url}`}>
                                            {item.title}
                                        </a>
                                    </PrimaryButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                    <SidebarBackButton onClick={() =>  navigate(-1)}/>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
