// export default async function handler(req, res) {
//     const { method, body } = req; 
//     const API_URL = `${process.env.NEXT_PUBLIC_FLASK_APIKEY}/upload`;
  
//     try {
//       const response = await fetch(API_URL, {
//         method,
//         headers: {
//             ...(method !== 'POST' && { 'Content-Type': req.headers['content-type'] || 'application/json' }),
//         },
//         body: method === 'POST' ? body : undefined, 
//       });
  
//       const data = await response.json(); 
//       res.status(response.status).json(data); 
//     } catch (error) {
//       console.error("Error calling the API:", error);
//       res.status(500).json({ error: "Failed to connect to the API." });
//     }
//   }

import https from "https";

export default async function handler(req, res) {
  const { method, body } = req;

  const API_HOST = process.env.NEXT_PUBLIC_FLASK_API_HOST;
  const API_PORT = process.env.NEXT_PUBLIC_FLASK_API_PORT;

  const options = {
    hostname: API_HOST, 
    port: API_PORT,     
    path: '/upload',    
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };


  const proxy = https.request(options, (response) => {
    let data = '';

 
    response.on('data', (chunk) => {
      data += chunk;
    });


    response.on('end', () => {
      try {
        res.status(response.statusCode).json(JSON.parse(data));
      } catch (error) {
        res.status(500).json({ error: "Invalid JSON response from server." });
      }
    });
  });


  proxy.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  });


  if (body) {
    proxy.write(JSON.stringify(body));
  }

  proxy.end();
}
