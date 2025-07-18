import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InterviewConfig } from "@/types/common";
import { Brain, MessageCircle, Mic, Settings, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface InterviewInterfaceProps {
  config: InterviewConfig;
  onBack: () => void;
}

interface Message {
  id: string;
  type: "user" | "interviewer";
  content: string;
  timestamp: Date;
}

export const InterviewInterface = ({
  config,
  onBack,
}: InterviewInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptionRef = useRef<HTMLDivElement>(null);

  // Simulate initial interviewer greeting
  useEffect(() => {
    const initialMessage: Message = {
      id: "1",
      type: "interviewer",
      content: `Hello! I'm your AI interviewer. Today we'll be focusing on ${
        config.mode === "skill"
          ? `${config.selectedSkill} questions`
          : "questions based on the job description you provided"
      } at a ${
        config.seniorityLevel
      } level. When you're ready, click the microphone to start recording your response to my first question: "Tell me about yourself and your experience with ${
        config.mode === "skill"
          ? config.selectedSkill
          : "the technologies mentioned in the job description"
      }."`,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, [config]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop =
        transcriptionRef.current.scrollHeight;
    }
  }, [messages, currentTranscription]);

  const handleStartRecording = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setIsConnected(true);

      // Here you would initialize WebSocket connection
      // For demo purposes, we'll simulate transcription
      simulateTranscription();
    } catch (error) {
      console.error("Failed to access microphone:", error);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (currentTranscription.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: currentTranscription,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setCurrentTranscription("");

      // Simulate processing and AI response
      setIsProcessing(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "interviewer",
          content:
            "Thank you for that response. That's a good overview of your background. Now let me ask you a more technical question: Can you explain the difference between props and state in React, and when you would use each?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsProcessing(false);
      }, 2000);
    }
  };

  // Simulate real-time transcription
  const simulateTransription = () => {
    const sampleText =
      "I have been working as a software developer for about 3 years now, primarily focusing on frontend development with React and TypeScript. I've worked on several projects including e-commerce platforms and dashboard applications.";
    const words = sampleText.split(" ");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length && isRecording) {
        setCurrentTranscription(
          (prev) => prev + (prev ? " " : "") + words[currentIndex]
        );
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 300);
  };

  const simulateTranscription = simulateTransription;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-border"
            >
              ← Back to Setup
            </Button>
            <div className="flex items-center space-x-2">
              <Badge
                className={cn(
                  "px-3 py-1",
                  isConnected
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                )}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="outline" className="border-border">
                {config.seniorityLevel} level
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-border">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Main Interview Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="ai-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Interview Conversation</h3>
              </div>

              <div
                ref={transcriptionRef}
                className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-background"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-4 text-sm",
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      )}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === "interviewer" && (
                          <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        )}
                        <div className="space-y-1">
                          <p className="leading-relaxed">{message.content}</p>
                          <p
                            className={cn(
                              "text-xs opacity-70",
                              message.type === "user"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Live Transcription */}
                {currentTranscription && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg p-4 bg-primary/10 border border-primary/20 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="space-y-1">
                          <p className="leading-relaxed text-primary">
                            {currentTranscription}
                          </p>
                          <p className="text-xs text-primary/70">
                            Live transcription...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-card border border-border text-sm">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-4 w-4 text-primary animate-pulse" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-muted-foreground">
                          AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recording Controls */}
          <div className="space-y-4">
            <Card className="ai-card p-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Voice Recording</h3>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    size="lg"
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                    className={cn(
                      "w-16 h-16 rounded-full",
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 recording-pulse"
                        : "ai-button-primary"
                    )}
                  >
                    {isRecording ? (
                      <Square className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    {isRecording
                      ? "Recording... Click to stop"
                      : "Click to start recording your response"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Interview Status */}
            <Card className="ai-card p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Session Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode:</span>
                    <span className="capitalize">
                      {config.mode === "skill"
                        ? config.selectedSkill
                        : "Job Description"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="capitalize">{config.seniorityLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span>{Math.floor(messages.length / 2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
