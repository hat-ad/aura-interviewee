import { InterviewInterface } from "@/components/sections/interview-interface";
import { SetupModal } from "@/components/sections/setup-modal";
import { Button } from "@/components/ui/button";
import type { InterviewConfig } from "@/types/common";
import { Brain, Code2, Mic, Zap } from "lucide-react";
import { useState } from "react";

const Main = () => {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [interviewConfig, setInterviewConfig] =
    useState<InterviewConfig | null>(null);

  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setIsSetupOpen(false);
  };

  const handleBackToSetup = () => {
    setInterviewConfig(null);
  };

  if (interviewConfig) {
    return (
      <InterviewInterface config={interviewConfig} onBack={handleBackToSetup} />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full"></div>
              <div className="relative bg-card border border-border/30 rounded-full p-6">
                <Brain className="h-16 w-16 text-primary mx-auto" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gradient">
              AI Interview Coach
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice technical interviews with AI-powered voice conversations.
              Get real-time feedback and improve your skills.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="ai-card p-6 text-center space-y-4">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Voice-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Natural voice conversations with real-time transcription
            </p>
          </div>

          <div className="ai-card p-6 text-center space-y-4">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Technical Focus</h3>
            <p className="text-sm text-muted-foreground">
              Practice specific skills or job-description based questions
            </p>
          </div>

          <div className="ai-card p-6 text-center space-y-4">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Adaptive AI</h3>
            <p className="text-sm text-muted-foreground">
              Questions adapt to your seniority level and responses
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            size="lg"
            onClick={() => setIsSetupOpen(true)}
            className="ai-button-primary text-lg px-8 py-3 h-auto"
          >
            Start Interview Practice
          </Button>
          <p className="text-sm text-muted-foreground">
            No signup required • Voice-enabled • Free to use
          </p>
        </div>
      </div>

      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onConfirm={handleStartInterview}
      />
    </div>
  );
};

export default Main;
