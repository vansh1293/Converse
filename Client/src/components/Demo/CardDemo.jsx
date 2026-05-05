import { ChevronRight, Search, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ContextMenuDemo } from "./ContextMenuDemo";
import { useDispatch, useSelector,shallowEqual } from "react-redux";
import { getUsers, setSelectedUser } from "@/redux/slice/chatSlice";
import defaultUserImage from "../../assets/defaultUserImage.jpeg";
import { Input } from "../ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CardDemo = ({ className, ...props }) => {
  const dispatch = useDispatch();
  const { users, selectedUser, isUserLoading } = useSelector((state) => state.chat, shallowEqual);
  const { onlineUsers } = useSelector((state) => state.auth,shallowEqual);
  const [viewOnlineUsers, setViewOnlineUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false);

  useEffect(() => {
    if (!hasFetchedUsers && !isUserLoading && users.length === 0) {
      setTimeout(() => {
      dispatch(getUsers());
      setHasFetchedUsers(true);
      }, 1000);
    }
  }, [dispatch]);

  const handleToggleOnlineUsers = useCallback(() => {
    setViewOnlineUsers((prev) => !prev);
  }, []);

  const handleSearchTermChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSelectUser = useCallback(
    (userId) => {
      dispatch(setSelectedUser(userId));
    },
    [dispatch]
  );

  const filteredUsers = (Array.isArray(users) ? users : []).filter(
    (user) =>
      (!viewOnlineUsers || onlineUsers.includes(user.id)) &&
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Card className={cn("md:w-[380px] w-screen", className)} {...props}>
      <div className="sticky top-0 z-10 bg-black">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search Users</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            You can only search people you follow
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Aunt May..."
              className="w-full"
              aria-label="Search users"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Search />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search users</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Toggle
            aria-label="Toggle online users"
            variant="outline"
            onClick={handleToggleOnlineUsers}
          >
            <Radio /> Online Users
          </Toggle>
        </CardHeader>
      </div>
      <CardContent className="grid gap-0 p-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-zinc-500 py-4">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <ContextMenuDemo key={user.id}>
                <button
                  onClick={() => handleSelectUser(user.id)}
                  className={cn(
                    "flex items-center border border-collapse space-x-4 py-3 px-4 w-full hover:bg-base-300 transition-colors",
                    selectedUser === user.id ? "bg-white/10" : "bg-black"
                  )}
                >
                  <Avatar>
                    <AvatarImage
                      src={user.profileImage || defaultUserImage}
                      className="object-cover"
                    />
                    <AvatarFallback>{user.name}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1">
                    <span>{user.fullName}</span>
                    {onlineUsers.includes(user.id) ? (
                      <span className="text-xs text-green-400">Online</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Offline
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </div>
                </button>
              </ContextMenuDemo>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
