import { useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import defaultUserImage from "../../assets/defaultUserImage.jpeg";
import { 
  getMessages, 
  subscribeToMessages, 
  unsubscribeToMessages, 
  deleteMessage 
} from "@/redux/slice/chatSlice";
import BlurText from "../ui/TextAnimations/BlurText/BlurText";
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";

export default function ChatAreaDemo() {
  const dispatch = useDispatch();
  const { messages, selectedUserData } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  // Scroll to the last message when messages update.
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Subscribe to messages when selectedUserData is available, and clean up on unmount.
  useEffect(() => {
    if (!selectedUserData) return;
    dispatch(getMessages(selectedUserData));
    dispatch(subscribeToMessages());
    return () => {
      dispatch(unsubscribeToMessages());
    };
  }, [dispatch, selectedUserData]);

  // Memoized handler to delete a message.
  const handleDeleteMessage = useCallback((message) => {
    dispatch(deleteMessage({ data: message, toast }));
  }, [dispatch, toast]);

  // Helper to format the message date.
  const formatDate = useCallback((dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Memoize the rendered messages list.
  const renderedMessages = useMemo(() => {
    // If no selected user, nothing to render.
    if (!selectedUserData) return null;

    return messages.map((message, index) => {
      const formattedDate = formatDate(message.createdAt);
      if (message.senderID === selectedUserData._id) {
        // Message from the selected user (incoming)
        return (
          <div key={index} ref={messagesEndRef}>
            <div className="flex flex-col items-start p-4">
              <div className="flex space-x-2">
                <Avatar>
                  <AvatarImage
                    src={selectedUserData.profileImage || defaultUserImage}
                    className="object-cover"
                  />
                  <AvatarFallback>{selectedUserData.name}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div
                    className={`p-2 px-4 rounded-xl ${
                      message.sender === selectedUserData._id
                        ? "bg-white/10 text-white"
                        : "bg-white/10"
                    } h-fit-content max-w-80 text-sm`}
                  >
                    {message.text === "" ? (
                      <img src={message.image} className="my-2 rounded-md" alt="message" />
                    ) : (
                      message.text
                    )}
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // Message from the current authUser (outgoing)
        return (
          <div key={index} ref={messagesEndRef}>
            <div className="flex flex-col p-4 items-end">
              <div className="flex space-x-2">
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div className="flex flex-col">
                      <div
                        className={`p-2 px-4 rounded-xl ${
                          message.sender === selectedUserData._id
                            ? "bg-white/10 text-white"
                            : "bg-white/10"
                        } h-fit-content max-w-80 text-sm`}
                      >
                        {message.text === "" ? (
                          <img src={message.image} className="my-2 rounded-md" alt="message" />
                        ) : (
                          message.text
                        )}
                      </div>
                      <span className="text-xs mt-2 text-muted-foreground text-right">
                        {formattedDate}
                      </span>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleDeleteMessage(message)}>
                      Delete this message
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                <Avatar>
                  <AvatarImage
                    src={authUser.profileImage || defaultUserImage}
                    className="object-cover"
                  />
                  <AvatarFallback>{authUser.name}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        );
      }
    });
  }, [messages, selectedUserData, handleDeleteMessage, formatDate]);

  return (
    <div className="flex flex-col w-full h-full z-0 overflow-hidden">
      <ScrollArea className="h-full w-full">
        {messages?.length === 0 ? (
          <div className="flex items-center w-full justify-center h-full">
            <BlurText
              text="Lol, there is nothing to showup👀"
              delay={100}
              animateBy="words"
              direction="top"
              className="text-2xl m-10"
            />
          </div>
        ) : null}
        {renderedMessages}
      </ScrollArea>
    </div>
  );
}
