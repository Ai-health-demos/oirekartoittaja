export async function POST(req: Request) {
  try {
    // Get the form data from the request
    const formData = await req.formData();
    
    // Get the URL for the Python backend
    const rahtiServiceUrl = process.env.RAHTI_SERVICE_URL || "http://localhost:8000";
    
    // Forward the request to the Python FastAPI backend
    const response = await fetch(`${rahtiServiceUrl}/api/v1/convert`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header, let fetch handle it for FormData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return Response.json(
        { error: errorData.error || "Python backend error" },
        { status: response.status }
      );
    }
    
    // Return the successful response from Python backend
    const data = await response.json();
    return Response.json(data);
    
  } catch (error) {
    console.error("Error in Python API proxy:", error);
    return Response.json(
      { error: "Failed to connect to Python backend" },
      { status: 500 }
    );
  }
}
