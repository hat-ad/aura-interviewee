import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SetupModalProps } from "@/types/common";
import { Brain, Briefcase, Code, Zap } from "lucide-react";
import { useState } from "react";

const SKILLS = [
  { id: "react", name: "React.js", icon: Code },
  { id: "nodejs", name: "Node.js", icon: Zap },
  { id: "golang", name: "Golang", icon: Brain },
  { id: "javascript", name: "JavaScript", icon: Code },
  { id: "typescript", name: "TypeScript", icon: Code },
  { id: "aws", name: "AWS Cloud", icon: Briefcase },
];

const SENIORITY_LEVELS = [
  {
    value: "junior",
    label: "Junior (0-2 years)",
    color: "bg-green-500/20 text-green-400",
  },
  {
    value: "mid",
    label: "Mid-level (2-5 years)",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    value: "senior",
    label: "Senior (5+ years)",
    color: "bg-purple-500/20 text-purple-400",
  },
];

export const SetupModal = ({ isOpen, onClose, onConfirm }: SetupModalProps) => {
  const [mode, setMode] = useState<"jd" | "skill">("skill");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");

  const handleConfirm = () => {
    if (
      seniorityLevel &&
      (mode === "skill" ? selectedSkill : jobDescription.trim())
    ) {
      onConfirm({
        jobDescription: mode === "jd" ? jobDescription : undefined,
        selectedSkill: mode === "skill" ? selectedSkill : undefined,
        seniorityLevel,
        mode,
      });
    }
  };

  const isValid =
    seniorityLevel &&
    (mode === "skill" ? selectedSkill : jobDescription.trim());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="ai-card border-0"
        style={{ maxWidth: "42rem" }} // 2xl = 42rem
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-gradient">
            Setup Your AI Interview
          </DialogTitle>
          <p className="text-muted-foreground text-base">
            Choose how you'd like to practice and set your experience level
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="space-y-1">
            <Label className="text-md font-medium">Interview Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant={"outline"}
                onClick={() => setMode("skill")}
                className={`h-auto p-4 justify-start transition-colors ${
                  mode === "skill"
                    ? "ai-button-primary"
                    : "border-border hover:border-primary hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Skill Practice</div>
                    <div className="text-sm opacity-80">
                      Practice specific technologies
                    </div>
                  </div>
                </div>
              </Button>
              <Button
                variant={"outline"}
                onClick={() => setMode("jd")}
                className={`h-auto p-4 justify-start transition-colors ${
                  mode === "jd"
                    ? "ai-button-primary"
                    : "border-border hover:border-primary hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Job Description</div>
                    <div className="text-sm opacity-80">
                      Based on specific JD
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Content Based on Mode */}
          {mode === "skill" ? (
            <div>
              <Label className="text-md font-medium">
                Select Skill to Practice
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {SKILLS.map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <Button
                      key={skill.id}
                      variant={"outline"}
                      onClick={() => setSelectedSkill(skill.id)}
                      className={` h-auto justify-start space-x-2 transition delay-0 duration-300 ease-in-out  ${
                        selectedSkill === skill.id ? "ai-button-primary" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{skill.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="jd" className="text-md font-medium">
                Job Description
              </Label>
              <Textarea
                id="jd"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[120px] resize-none border-border focus:border-primary bg-background/50 mt-3"
              />
            </div>
          )}

          {/* Seniority Level */}
          <div className="space-y-2">
            <Label className="text-md font-medium">Experience Level</Label>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {SENIORITY_LEVELS.map((level) => (
                <Button
                  key={level.value}
                  variant={"outline"}
                  onClick={() => setSeniorityLevel(level.value)}
                  className={`h-auto p-3 justify-start transition-colors ${
                    seniorityLevel === level.value
                      ? "ai-button-primary"
                      : "border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">
                      {level.label.split(" ")[0]}
                    </div>
                    <div className="text-xs opacity-80">
                      {level.label.split(" ").slice(1).join(" ")}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border/30">
          <Button variant="outline" onClick={onClose} className="border-border">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="ai-button-primary disabled:opacity-50"
          >
            Start Interview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
