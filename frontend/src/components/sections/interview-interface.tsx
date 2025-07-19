import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useWebSocket from "@/hooks/useWebsocket";
import { cn } from "@/lib/utils";
import {
  continueInterviewService,
  endInterviewService,
  initInterviewService,
} from "@/services/interviewer";
import type { InterviewConfig } from "@/types/common";
import { Brain, MessageCircle, Mic, Settings, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
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
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const transcriptionRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const { isConnected, lastMessage, sendMessage, closeConnection } =
    useWebSocket("ws://localhost:8080", { reconnect: true });

  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.event) {
        case "transcription:stream:recognized":
          setCurrentTranscription(
            (prev) => prev + lastMessage.payload.data.text
          );
          break;
        case "transcription:stream:closed":
          askQuestion(currentTranscription);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "user",
              content: currentTranscription,
              timestamp: new Date(),
            },
          ]);
          setCurrentTranscription("");
          break;
      }
    }
  }, [lastMessage]);

  // Simulate initial interviewer greeting
  useEffect(() => {
    initInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.success("Recording started!");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 }); // Azure prefers 16kHz
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1); // mono

      audioContextRef.current = audioContext;
      processorRef.current = processor;
      sourceRef.current = source;

      setIsRecording(true);

      // Tell backend recording has started
      sendMessage({
        event: "TRANSCRIPTION",
        subevent: "transcription:stream:init",
        payload: { language: "en-US" },
      });

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const pcmBuffer = new ArrayBuffer(input.length * 2);
        const view = new DataView(pcmBuffer);

        for (let i = 0; i < input.length; i++) {
          let sample = input[i];
          sample = Math.max(-1, Math.min(1, sample));
          view.setInt16(i * 2, sample * 0x7fff, true);
        }

        const uint8 = new Uint8Array(pcmBuffer);

        // Stream PCM binary data through WebSocket
        sendMessage({
          event: "TRANSCRIPTION",
          subevent: "transcription:stream:binary",
          payload: uint8,
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination); // Optional: connect to speakers
    } catch (error) {
      toast.error("Failed to access microphone!");
      console.error("Microphone access error:", error);
      setIsRecording(false);
      closeConnection();
    }
  };

  const handleStopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);

    sendMessage({
      event: "TRANSCRIPTION",
      subevent: "transcription:stream:close",
      payload: {},
    });
  };

  const initInterview = async () => {
    setIsProcessing(true);
    const response = await initInterviewService(
      config.mode,
      config.seniorityLevel,
      config.selectedSkill,
      config.jobDescription
    );
    if (typeof response === "string") {
      toast.error(response);
    } else {
      setSessionId(response.sessionID);
      const initialMessage: Message = {
        id: Date.now().toString(),
        type: "interviewer",
        content: response.response,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
    setIsProcessing(false);
  };
  const askQuestion = async (userResponse: string) => {
    setIsProcessing(true);
    const response = await continueInterviewService(userResponse, sessionId);
    if (typeof response === "string") {
      toast.error(response);
    } else {
      setSessionId(response.sessionID);
      const message: Message = {
        id: Date.now().toString(),
        type: "interviewer",
        content: response.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);
    }
    setIsProcessing(false);
  };

  const endInterview = async () => {
    setIsProcessing(true);
    const response = await endInterviewService(sessionId);
    if (typeof response === "string") {
      toast.error(response);
    } else {
      setSessionId(response.sessionID);
      const message: Message = {
        id: Date.now().toString(),
        type: "interviewer",
        content: response.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);
    }
    setIsProcessing(false);
  };

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
                        <div className="space-y-1 text-left">
                          <p className="leading-relaxed text-left">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </p>
                          <p
                            className={cn(
                              "text-xs opacity-70 text-left",
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
                          Aura AI is thinking...
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
              <Button
                variant={"destructive"}
                onClick={endInterview}
                className="mt-4"
              >
                End Interview
              </Button>
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
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
