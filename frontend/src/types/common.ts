export interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: InterviewConfig) => void;
}

export interface InterviewConfig {
  jobDescription?: string;
  selectedSkill?: string;
  seniorityLevel: string;
  mode: "jd" | "skill";
}

export interface ServiceResponse<T> {
  status: boolean;
  data: T;
  message: string;
}
