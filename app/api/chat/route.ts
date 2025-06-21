import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    // TODO: Implement proper rate limiting with Redis or similar
    // For now, we'll rely on Gemini's built-in rate limiting

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Basic content validation
    if (!text || text.length < 5) {
      throw new Error('Invalid AI response');
    }

    return NextResponse.json({
      success: true,
      response: text.trim()
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Return appropriate error messages
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'API configuration error' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('QUOTA')) {
        return NextResponse.json(
          { error: 'API quota exceeded' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 