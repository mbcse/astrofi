import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const fileUrl = `${backendUrl}/api/walrus/files/${fileId}`;
    
    console.log('Proxying image request for file:', fileId);
    console.log('Backend URL:', fileUrl);

    // Fetch the image from the backend
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error('Backend response not ok:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch image from backend' }, 
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    console.log('Successfully fetched image, size:', imageBuffer.byteLength, 'bytes');
    console.log('Content type:', contentType);

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error proxying image request:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 