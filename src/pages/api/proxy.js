import { NextResponse } from 'next/server';

export async function POST(request) {
  const target = process.env.NEXT_PUBLIC_FLASK_APIKEY;
  
  if (!target) {
    return new NextResponse('API URL not configured', { status: 500 });
  }

  try {
    const formData = await request.formData();
    const apiUrl = `${target}/upload`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}