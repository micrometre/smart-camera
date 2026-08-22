// Simple in-memory storage for demo (replace with Vercel Postgres in production)
let detections = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids must be an array' });
      }

      // Filter out deleted detections
      const toDelete = detections.filter(entry => ids.includes(entry.id));
      detections = detections.filter(entry => !ids.includes(entry.id));

      return res.status(200).json({ success: true, deleted: toDelete.length });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete detections' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
