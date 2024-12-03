export default async function handler(req, res) {
    const { method, body } = req; 
    const API_URL = `${process.env.NEXT_PUBLIC_FLASK_APIKEY}/upload`;
  
    try {
      const response = await fetch(API_URL, {
        method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
        },
        body: method === 'POST' ? body : undefined, 
      });
  
      const data = await response.json(); 
      res.status(response.status).json(data); 
    } catch (error) {
      console.error("Error calling the API:", error);
      res.status(500).json({ error: "Failed to connect to the API." });
    }
  }
  