// Simple in-memory storage for demo (replace with Vercel Postgres in production)
let detections = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Calculate statistics
      const classCounts = {};
      let totalDetections = 0;

      detections.forEach(entry => {
        entry.detections.forEach(d => {
          classCounts[d.class] = (classCounts[d.class] || 0) + 1;
          totalDetections++;
        });
      });

      const stats = {
        totalEntries: detections.length,
        totalDetections,
        classCounts,
        lastDetection: detections.length > 0 ? detections[detections.length - 1].timestamp : null
      };

      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to calculate statistics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
