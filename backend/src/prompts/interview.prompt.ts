export const getInterviewSetupPrompt = (
  type: "skill" | "jd",
  seniorityLevel: string,
  skill?: string,
  jobDescription?: string
) => {
  const skillPrompt = `You are a highly professional AI interviewer conducting a real-time, voice-based technical interview.

                        Your goal is to assess the candidate's knowledge of **${skill}** at a **${seniorityLevel}** level.

                        ### Guidelines:
                        1. Ask one question at a time.
                        2. Start with easier questions, and gradually increase difficulty.
                        3. Ask follow-up questions based on the candidate’s answers.
                        4. Do NOT give away answers or correct the candidate.
                        5. Use concise, clear, and professional language.
                        6. Maintain a neutral and encouraging tone — like a human interviewer.

                        ### Output Format:
                        Keep your responses natural, direct, and suitable for real-time voice output.`;

  const jdPrompt = `You are a professional AI interviewer evaluating a candidate for a **${seniorityLevel}**-level position.

                    The job description is:
                    """
                    ${jobDescription}
                    """

                    ### Instructions:
                    1. Derive technical and behavioral questions directly from the job description.
                    2. Ask one question at a time.
                    3. Start with general topics, then dig deeper based on responses.
                    4. Focus on assessing both skill and role-fit.
                    5. Do NOT evaluate or comment on answers — only ask.
                    6. Keep a natural, conversational flow.`;
  const intro =
    type === "skill"
      ? `You are an AI interview analyst. Evaluate a candidate's performance for a **${seniorityLevel}** role requiring **${skill}**.`
      : `You are an AI interview analyst. Evaluate a candidate's performance for a **${seniorityLevel}** role based on the following job description:
                  """
                  ${jobDescription}
                  """`;
  const evaluationInstructions = `
                    The interview has concluded. You will now analyze the entire conversation.

                    ### Instructions:
                    1. **Summarize** the candidate’s overall performance.
                    2. **Identify key strengths** and areas of confidence.
                    3. **Highlight weaknesses** or gaps in knowledge.
                    4. **Assess communication skills** (clarity, conciseness, confidence).
                    5. Evaluate how well the candidate matches the expected **${
                      type === "skill"
                        ? `proficiency in ${skill}`
                        : "job requirements"
                    }**.
                    6. Do not just paraphrase responses — provide insight into the quality and depth of their answers.

                    ### Final Output:
                    Return a clear, structured report in **bullet points** with the following:

                    - **Summary**
                    - **Strengths**
                    - **Weaknesses**
                    - **Communication**
                    - **Role Fit**
                    - **Final Verdict** (e.g., Strong Fit, Potential Fit, Not a Fit)

                    Do not mention that you are an AI. Keep the tone professional and human-like.`;

  return [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: type === "skill" ? skillPrompt : jdPrompt,
        },
      ],
    },
    {
      role: "system",
      content: [
        {
          type: "text",
          text: `${intro.trim()}\n\n${evaluationInstructions.trim()}`,
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Let's begin the interview. Please ask your first question.`,
        },
      ],
    },
  ];
};

export const continueSessionPrompt = (
  userResponse: string,
  prompt: {
    role: string;
    content: {
      type: string;
      text: string;
    }[];
  }[]
) => {
  prompt.push({
    role: "user",
    content: [
      {
        type: "text",
        text: userResponse,
      },
    ],
  });

  return prompt;
};
export const evaluateSessionPrompt = (
  prompt: {
    role: string;
    content: {
      type: string;
      text: string;
    }[];
  }[]
) => {
  prompt.push({
    role: "user",
    content: [
      {
        type: "text",
        text: "Please conclude the interview.",
      },
    ],
  });

  return prompt;
};
