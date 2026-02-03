import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as Blob;
        const questionText = formData.get('question') as string;

        if (!audioFile || !questionText) {
            return NextResponse.json({ error: "Missing audio or question" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Mock response for testing without API key
            return NextResponse.json({
                transcript: "This is a mock transcript because no API key was found.",
                contentScore: 85,
                confidenceScore: 78,
                deliveryScore: 80,
                feedback: "Good answer, but try to be more specific with examples.",
                strengths: ["Clear voice", "Good structure"],
                improvements: ["Reduce filler words", "Provide more context"]
            });
        }

        // Convert Blob to Base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a high-stakes senior executive interviewer. Analyze the candidate's audio answer for the following question:
            "${questionText}"

            SCORING CRITERIA:
            1. Content Quality (40%): Did they provide specific evidence? Did they use the STAR method? Is the answer relevant?
            2. Confidence & Presence (30%): Tone, pace, reduction of filler words (um, ah), and vocal authority.
            3. Delivery & Structure (30%): Logical flow, clarity of thought, and professional vocabulary.

            INSTRUCTIONS:
            - Be direct and professional in your feedback.
            - Provide a critical analysis. If the answer is vague, score accordingly.
            - Transcribe the answer accurately.
            
            RETURN JSON ONLY:
            {
                "transcript": "Full text of what they said...",
                "contentScore": 0-100,
                "confidenceScore": 0-100,
                "deliveryScore": 0-100,
                "feedback": "One sentence direct summary of their performance.",
                "strengths": ["Critical Strength 1", "Critical Strength 2"],
                "improvements": ["Specific Improvement 1", "Specific Improvement 2"]
            }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "audio/webm",
                    data: base64Audio
                }
            }
        ]);

        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown
        if (text.startsWith("```json")) text = text.replace(/```json|```/g, "");
        if (text.startsWith("```")) text = text.replace(/```/g, "");

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            console.error("Failed to parse Gemini analysis:", text);
            return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Answer Analysis Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
