
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isAi: boolean;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAi, timestamp }) => {
  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4 animate-fadeIn",
        isAi ? "bg-secondary/10" : ""
      )}
    >
      <Avatar className={cn(
        "h-8 w-8",
        isAi ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
      )}>
        <span className="text-sm">{isAi ? "AI" : "You"}</span>
      </Avatar>
      <div className="flex flex-col flex-1">
        <p className="text-sm text-foreground/90">{message}</p>
        <span className="text-xs text-foreground/60 mt-1">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
