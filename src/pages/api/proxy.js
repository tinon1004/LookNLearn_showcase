import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request) {
  const target = process.env.NEXT_PUBLIC_FLASK_APIKEY;
  
  if (!target) {
    return new NextResponse('API URL not configured', { status: 500 });
  }

  try {
    const formData = await request.formData();
    const apiUrl = `${target}/upload`;

    console.log('Sending request to:', apiUrl); // 디버깅용 로그

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Origin': process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
      },
      body: formData,
      mode: 'cors',
    });

    console.log('Response status:', response.status); // 디버깅용 로그

    if (!response.ok) {
      console.error('Server response:', await response.text()); // 디버깅용 로그
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Detailed proxy error:', error); // 디버깅용 로그
    return new NextResponse(
      JSON.stringify({ error: error.message || '서버 오류가 발생했습니다' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}