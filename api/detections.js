// Simple in-memory storage for demo (replace with Vercel Postgres in production)
let detections = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { limit, class: filterClass } = req.query;

    let filteredDetections = [...detections];

    // Filter by class if specified
    if (filterClass) {
      filteredDetections = filteredDetections.filter(entry =>
        entry.detections.some(d => d.class.toLowerCase() === filterClass.toLowerCase())
      );
    }

    // Limit results if specified
    if (limit) {
      filteredDetections = filteredDetections.slice(-parseInt(limit));
    }

    // Return in reverse chronological order (newest first)
    return res.status(200).json(filteredDetections.reverse());
  }

  if (req.method === 'POST') {
    try {
      const { detections: newDetections, timestamp, image } = req.body;

      if (!Array.isArray(newDetections)) {
        return res.status(400).json({ error: 'Detections must be an array' });
      }

      // In production, upload image to Vercel Blob Storage here
      let imagePath = null;
      if (image) {
        // TODO: Implement Vercel Blob Storage upload
        // For now, just store the base64 data
        imagePath = `data:image/png;base64,${image.replace(/^data:image\/\w+;base64,/, '')}`;
      }

      const entry = {
        id: Date.now(),
        timestamp: timestamp || new Date().toISOString(),
        detections: newDetections.map(d => ({
          class: d.class,
          score: d.score,
          bbox: d.bbox
        })),
        imagePath
      };

      detections.push(entry);

      // Keep only last 1000 entries
      if (detections.length > 1000) {
        detections = detections.slice(-1000);
      }

      return res.status(200).json({ success: true, id: entry.id, imagePath });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save detections' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      detections = [];
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to clear detections' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
