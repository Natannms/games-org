
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bell,
  Swords,
  Users,
  Search,
  Building,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarRail
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", icon: Swords, label: "Games" },
  { href: "/dashboard/members", icon: Users, label: "Members" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const membersQuery = query(collection(db, "games_members"), where("uid", "==", user.uid));
        const membersSnapshot = await getDocs(membersQuery);
        if (!membersSnapshot.empty) {
            const memberData = membersSnapshot.docs[0].data();
            const orgId = memberData.organizationId;
            const orgDocRef = doc(db, "game_organization", orgId);
            const orgDocSnap = await getDoc(orgDocRef);
            if (orgDocSnap.exists()) {
                setOrganizationName(orgDocSnap.data().name);
            }
        }
      } else {
        setOrganizationName("");
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navContent = (
    <SidebarMenu>
        {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname === item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full">
        <Sidebar>
            <SidebarHeader>
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Logo className="h-6 w-6 text-primary" />
                    <span className="font-headline">OrgPlay</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                {navContent}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>

        <SidebarInset>
            <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="w-full flex-1">
                    <form>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                        />
                    </div>
                    </form>
                </div>
                <div className="flex items-center gap-4">
                    {organizationName && (
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{organizationName}</span>
                    </div>
                    )}
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src="https://placehold.co/100x100" alt="@shadcn" data-ai-hint="user avatar" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                {children}
            </main>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
