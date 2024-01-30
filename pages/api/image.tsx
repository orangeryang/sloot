import type { NextApiRequest, NextApiResponse } from 'next';

const imageUrl = "../../assets/1.jpg";
const buttonText = "My Loot";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Recorded</title>
          <meta property="og:title" content="Synthetic Loot">
          <meta property="og:image" content="${ imageUrl }">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${ imageUrl }">
          <meta name="fc:frame:post_url" content="">
          <meta name="fc:frame:button:1" content="${ buttonText }">¬
        </head>
        <body> My Loot </body>
      </html>
    `);
    
}
