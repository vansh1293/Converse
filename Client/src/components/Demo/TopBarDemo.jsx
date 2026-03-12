import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import defaultUserImage from "../../assets/defaultUserImage.jpeg";
import { Video } from "lucide-react";
import { Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import {
  setSelectedUserData,
  setSelectedUser,
  getMessages,
} from "@/redux/slice/chatSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { setCallerData } from "@/redux/slice/callSlice";
export default function TopBarDemo() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { onlineUsers } = useSelector((state) => state.auth);
  const { users, selectedUser, selectedUserData } = useSelector(
    (state) => state.chat
  );
  const [isImagePreview, setIsImagePreview] = useState(false);
  useEffect(() => {
    if (selectedUser) {
      const user = users.find((user) => user.id === selectedUser);
      if (user) {
        dispatch(setSelectedUserData(user));
        dispatch(getMessages(user));
      }
    }
  }, [selectedUser, dispatch]);

  const handleCall = async () => {
    if (!onlineUsers.includes(selectedUser)) {
      toast({
        variant: "destructive",
        title: "Calling is only available to Online Users",
        description: "User is not online",
      });
      return;
    }
    // const userStream = await navigator.mediaDevices.getUserMedia({
    //   video: true,
    //   audio: true,
    // });
    // if (userStream && userStream.getVideoTracks().length > 0) {
    //   dispatch(setCallerData(selectedUserData));
    //   navigate(`/outgoingCall/${selectedUser}`);
    // } else {
    //   toast({
    //     variant: "destructive",
    //     title: "Error",
    //     description: "Unable to access camera and microphone",
    //   });
    toast({
      title: "Calling feature is not available yet",
      description: "This feature is under development",
    });
    return;
  };

  return (
    <div className="flex items-center justify-between bg-black p-8 h-12 border border-collapse w-full sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <Avatar
          onClick={() => setIsImagePreview(true)}
          className="cursor-pointer"
        >
          <AvatarImage
            src={selectedUserData?.profileImage || defaultUserImage}
            className="object-cover"
          />
          <AvatarFallback>{selectedUserData?.fullName || "?"}</AvatarFallback>
        </Avatar>
        <Sheet>
          <SheetTrigger asChild>
            <div className="cursor-pointer">
              <h1 className="text-white font-medium text-lg">
                {selectedUserData?.fullName || "User"}
              </h1>
            </div>
          </SheetTrigger>
          <SheetContent className=" items-center">
            <SheetHeader className="flex flex-col items-center">
              <Avatar className="cursor-pointer h-40 w-40 mt-10 ">
                <AvatarImage
                  src={selectedUserData?.profileImage || defaultUserImage}
                  className="object-cover  "
                />
                <AvatarFallback>
                  {selectedUserData?.fullName || "?"}
                </AvatarFallback>
              </Avatar>

              <SheetTitle className="text-3xl">
                {selectedUserData?.fullName || "User"}
              </SheetTitle>
              <SheetDescription>
                {selectedUserData?.about || "User Bio"}
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-2" />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleCall}>
                <Video className="w-5 h-5  cursor-pointer hover:text-gray-300 transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Video Call</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleCall}>
                <Phone className="w-5 h-5  cursor-pointer hover:text-gray-300 transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Audio Call</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => dispatch(setSelectedUser(null))}
              >
                <X className="w-5 h-5  cursor-pointer hover:text-gray-300 transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {isImagePreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
          <div className="relative">
            <div className="border-container  ">
              <div className="border-animation "></div>
              <img
                src={selectedUserData?.profileImage || defaultUserImage}
                alt="User Preview"
                className="w-60 h-60 rounded-full object-cover shadow-lg absolute inset-0 m-auto"
              />
            </div>
            <X
              className="absolute -top-6 -right-6 w-10 h-10 text-white cursor-pointer bg-black/50 p-2 rounded-full hover:bg-black"
              onClick={() => setIsImagePreview(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
