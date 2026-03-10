import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
  } from "@/components/ui/context-menu"
  
  export function ContextMenuDemo({children}) {
    return (
      <ContextMenu>
        <ContextMenuTrigger className="relative w-full flex">
            {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-full mr-6">
          <ContextMenuItem inset>
            New Chat
          </ContextMenuItem>
          <ContextMenuItem inset>
            Mark as Read
          </ContextMenuItem>
          <ContextMenuItem inset>
            Mute Notifications
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>More Options</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                Archive Chat
              </ContextMenuItem>
              <ContextMenuItem>Delete Chat</ContextMenuItem>
              <ContextMenuItem>Pin Chat</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Report</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>
            Show Online Status
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Enable Dark Mode</ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value="all">
            <ContextMenuLabel inset>Chat Status</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuRadioItem value="all">
              All Chats
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="unread">Unread Chats</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )
  }
