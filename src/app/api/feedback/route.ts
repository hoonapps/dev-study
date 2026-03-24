import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { question, correctAnswer, userAnswer, explanation, seniorTip, apiKey } = await req.json();

  if (!apiKey) {
    return NextResponse.json({ feedback: "" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: `You are a senior developer mentor (10+ years experience) who coaches mid-level developers.
Your role is NOT to just say "wrong" or "correct". Instead:
- Acknowledge what the user got right in their thinking
- Gently point out what they missed or misunderstood
- Explain the correct way to think about this topic
- Use analogies or real-world scenarios they'd encounter at work
- Speak naturally like a helpful senior colleague, not a textbook
- Answer in Korean (한국어)
- Keep it concise but insightful (3-5 sentences)
- End with a thought-provoking follow-up question to deepen understanding`,
        messages: [
          {
            role: "user",
            content: `Question: ${question}

Correct Answer: ${correctAnswer}

User's Answer: ${userAnswer}

Reference Explanation: ${explanation}

Senior Tip: ${seniorTip}

Please provide mentoring feedback on the user's answer. Be encouraging but honest.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const feedback = data.content?.[0]?.text || "";

    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({ feedback: "AI feedback unavailable." }, { status: 500 });
  }
}
