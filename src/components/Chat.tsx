
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
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
}

interface ChatProps {
  diseaseResult: DiseaseResult | null;
}

const Chat: React.FC<ChatProps> = ({ diseaseResult }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      text: input,
      isAi: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Generate contextual response based on disease results
    const aiResponse = generateResponse(input, diseaseResult);
    setTimeout(() => {
      const aiMessage: Message = {
        text: aiResponse,
        isAi: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateResponse = (userInput: string, diseaseResult: DiseaseResult | null): string => {
    if (!diseaseResult) {
      return "Please upload a plant image first so I can provide specific advice about your plant's condition.";
    }

    const disease = diseaseResult.diseases[0];
    
    if (!disease) {
      return "Based on the analysis, your plant appears healthy! Is there anything specific you'd like to know about maintaining its health?";
    }

    const inputLower = userInput.toLowerCase();
    
    if (inputLower.includes('treatment') || inputLower.includes('cure') || inputLower.includes('fix')) {
      return `To treat ${disease.name}, here are some recommendations: ${disease.treatment.prevention.join('. ')}`;
    }
    
    if (inputLower.includes('confidence') || inputLower.includes('sure')) {
      return `I am ${Math.round(disease.probability * 100)}% confident that your plant is affected by ${disease.name}.`;
    }
    
    if (inputLower.includes('what') || inputLower.includes('problem') || inputLower.includes('issue')) {
      return `Your plant appears to be affected by ${disease.name}. Would you like to know more about the treatment options?`;
    }

    return `I can help you understand more about the detected ${disease.name}. You can ask about treatments, confidence level, or any other specific questions about your plant's condition.`;
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
          />
          <Button onClick={handleSend} className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Chat;
