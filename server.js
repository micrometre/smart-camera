import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'detections.json');
const IMAGES_DIR = path.join(__dirname, 'public', 'images');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));
app.use('/images', express.static(IMAGES_DIR));

console.log('🚀 Smart Camera backend starting...');
console.log(`📁 Data file: ${DATA_FILE}`);
console.log(`🖼️  Images directory: ${IMAGES_DIR}`);

// Initialize data file and images directory if they don't exist
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
    console.log('✅ Data file exists');
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
    console.log('✅ Created new data file');
  }

  try {
    await fs.access(IMAGES_DIR);
    console.log('✅ Images directory exists');
  } catch {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log('✅ Created images directory');
  }
}

// POST endpoint to capture detections
app.post('/api/detections', async (req, res) => {
  try {
    const { detections, timestamp, image } = req.body;
    
    console.log('📥 Received detection request');
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   Detections count: ${detections?.length || 0}`);
    console.log(`   Has image: ${!!image}`);
    
    if (!Array.isArray(detections)) {
      console.error('❌ Invalid detections format');
      return res.status(400).json({ error: 'Detections must be an array' });
    }

    // Read existing data
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const allDetections = JSON.parse(data);

    // Save image if provided
    let imagePath = null;
    if (image) {
      try {
        const timestampStr = timestamp || new Date().toISOString();
        const filename = `detection_${Date.now()}.png`;
        imagePath = path.join(IMAGES_DIR, filename);
        
        // Convert base64 to buffer and save
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(imagePath, buffer);
        
        console.log(`✅ Image saved: ${filename}`);
        imagePath = `/images/${filename}`;
      } catch (imgError) {
        console.error('❌ Error saving image:', imgError);
      }
    }

    // Add new detection entry
    const entry = {
      id: Date.now(),
      timestamp: timestamp || new Date().toISOString(),
      detections: detections.map(d => ({
        class: d.class,
        score: d.score,
        bbox: d.bbox
      })),
      imagePath
    };

    allDetections.push(entry);

    // Keep only last 1000 entries to prevent file from growing too large
    if (allDetections.length > 1000) {
      allDetections.splice(0, allDetections.length - 1000);
      console.log('🔄 Trimmed detection history to 1000 entries');
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(allDetections, null, 2));
    console.log(`✅ Detection saved with ID: ${entry.id}`);

    res.json({ success: true, id: entry.id, imagePath });
  } catch (error) {
    console.error('❌ Error saving detections:', error);
    res.status(500).json({ error: 'Failed to save detections' });
  }
});

// GET endpoint to retrieve detection history
app.get('/api/detections', async (req, res) => {
  try {
    const { limit, class: filterClass } = req.query;
    
    console.log('📤 GET /api/detections request');
    console.log(`   Limit: ${limit || 'none'}`);
    console.log(`   Filter class: ${filterClass || 'none'}`);
    
    const data = await fs.readFile(DATA_FILE, 'utf8');
    let allDetections = JSON.parse(data);

    console.log(`   Total entries in database: ${allDetections.length}`);

    // Filter by class if specified
    if (filterClass) {
      allDetections = allDetections.filter(entry => 
        entry.detections.some(d => d.class.toLowerCase() === filterClass.toLowerCase())
      );
      console.log(`   After filtering by class: ${allDetections.length} entries`);
    }

    // Limit results if specified
    if (limit) {
      allDetections = allDetections.slice(-parseInt(limit));
      console.log(`   After limiting: ${allDetections.length} entries`);
    }

    // Return in reverse chronological order (newest first)
    res.json(allDetections.reverse());
    console.log('✅ Detection history sent successfully');
  } catch (error) {
    console.error('❌ Error reading detections:', error);
    res.status(500).json({ error: 'Failed to read detections' });
  }
});

// GET endpoint for detection statistics
app.get('/api/stats', async (req, res) => {
  try {
    console.log('📊 GET /api/stats request');
    
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const allDetections = JSON.parse(data);

    // Calculate statistics
    const classCounts = {};
    let totalDetections = 0;

    allDetections.forEach(entry => {
      entry.detections.forEach(d => {
        classCounts[d.class] = (classCounts[d.class] || 0) + 1;
        totalDetections++;
      });
    });

    const stats = {
      totalEntries: allDetections.length,
      totalDetections,
      classCounts,
      lastDetection: allDetections.length > 0 ? allDetections[allDetections.length - 1].timestamp : null
    };

    console.log('   Statistics:', stats);
    res.json(stats);
    console.log('✅ Statistics sent successfully');
  } catch (error) {
    console.error('❌ Error calculating stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// DELETE endpoint to clear all detections
app.delete('/api/detections', async (req, res) => {
  try {
    console.log('🗑️  DELETE /api/detections request - clearing all detections');
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
    console.log('✅ All detections cleared');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error clearing detections:', error);
    res.status(500).json({ error: 'Failed to clear detections' });
  }
});

// Start server
initDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Smart Camera backend running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available:`);
    console.log(`   POST   /api/detections - Capture detection data`);
    console.log(`   GET    /api/detections - Retrieve detection history`);
    console.log(`   GET    /api/stats      - Get detection statistics`);
    console.log(`   DELETE /api/detections - Clear all detections`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize data file:', err);
  process.exit(1);
});
