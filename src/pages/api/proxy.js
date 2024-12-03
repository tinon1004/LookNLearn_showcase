import { NextResponse } from 'next/server';

export async function GET(request) {
  const { pathname, searchParams } = new URL(request.url);
  
  const target = process.env.NEXT_PUBLIC_FLASK_APIKEY?.replace('https://', 'http://');
  
  if (!target) {
    return new NextResponse('API URL not configured', { status: 500 });
  }

  try {
    const queryString = Array.from(searchParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
      
    const apiUrl = `${target}${pathname.replace('/api', '')}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Proxy error', { status: 500 });
  }
}

export async function POST(request) {
  const target = process.env.NEXT_PUBLIC_FLASK_APIKEY?.replace('https://', 'http://');
  
  if (!target) {
    return new NextResponse('API URL not configured', { status: 500 });
  }

  try {
    const body = await request.blob();
    const apiUrl = `${target}/upload`; 

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: body,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Proxy error', { status: 500 });
  }
}