"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, LogOut, Settings, Monitor } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

export default function SidebarFooterUser() {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!isLoaded || !mounted) {
    return (
      <div className="flex items-center gap-2 px-1">
        <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-28 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  const name = user?.fullName ?? user?.username ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const avatarUrl = user?.imageUrl;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1 w-full
                     hover:bg-muted transition-colors min-w-0
                     group-data-[collapsible=icon]:justify-center"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0 text-left group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium truncate leading-tight">
              {name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate leading-tight">
              {email}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-72">

        {/* User info at top of dropdown */}
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate">{name}</span>
            <span className="text-[12px] text-muted-foreground break-all">
              {email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Theme toggle section */}
        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1">
          Theme
        </DropdownMenuLabel>

        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => setTheme("light")}
        >
          <Sun className="h-3.5 w-3.5" />
          Light
          {theme === "light" && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              Active
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-3.5 w-3.5" />
          Dark
          {theme === "dark" && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              Active
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => setTheme("system")}
        >
          <Monitor className="h-3.5 w-3.5" />
          System
          {theme === "system" && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              Active
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Manage account */}
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => openUserProfile()}
        >
          <Settings className="h-3.5 w-3.5" />
          Manage account
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive cursor-pointer"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}