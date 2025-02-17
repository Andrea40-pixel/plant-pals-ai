
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ChatMessage from './ChatMessage';

interface DiseaseResult {
  diseases: Array<{
    name: string;
    probability: number;
    treatment: {
      prevention: string[];
      chemical: string[];
      biological: string[];
    };
  }>;
}

interface Message {
  text: string;
  isAi: boolean;
  timestamp: Date;
  role?: 'user' | 'assistant';
}

interface ChatProps {
  diseaseResult: DiseaseResult | null;
}

const Chat: React.FC<ChatProps> = ({ diseaseResult }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (diseaseResult) {
      const initialMessage: Message = {
        text: "Hello! I've analyzed your plant. How can I help you understand its condition?",
        isAi: true,
        timestamp: new Date(),
        role: 'assistant'
      };
      setMessages([initialMessage]);
    }
  }, [diseaseResult]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input,
      isAi: false,
      timestamp: new Date(),
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const formattedMessages = messages
        .concat(userMessage)
        .map(msg => ({
          role: msg.role || (msg.isAi ? 'assistant' : 'user'),
          content: msg.text
        }));

      const { data, error } = await supabase.functions.invoke('chat-with-deepseek', {
        body: {
          messages: formattedMessages,
          diseaseInfo: diseaseResult
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        text: data.response,
        isAi: true,
        timestamp: new Date(),
        role: 'assistant'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        text: "I apologize, but I encountered an error. Please try again.",
        isAi: true,
        timestamp: new Date(),
        role: 'assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto h-[600px] flex flex-col bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Plant Disease Assistant</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isAi={message.isAi}
              timestamp={message.timestamp}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            className="bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Chat;
