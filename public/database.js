class DatabaseManager {
  constructor() {
    this.promiser = null;
    this.dbId = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('Loading and initializing SQLite3 module...');
      const sqlite3Worker1Promiser = await this.loadWorkerFromPublic();

      this.promiser = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        });
      });

      const response = await this.promiser('open', {
        filename: 'file:smart_camera.sqlite3?vfs=opfs',
      });

      this.dbId = response.dbId;
      console.log('Database opened with ID:', this.dbId);

      await this.createTables();
      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  async loadWorkerFromPublic() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/sqlite-wasm/jswasm/sqlite3-worker1-promiser.js';
      script.type = 'text/javascript';
      
      script.onload = () => {
        if (typeof window.sqlite3Worker1Promiser === 'function') {
          resolve(window.sqlite3Worker1Promiser);
        } else {
          reject(new Error('sqlite3Worker1Promiser not available'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load SQLite worker script'));
      };
      
      document.head.appendChild(script);
    });
  }

  async createTables() {
    if (!this.promiser || !this.dbId) throw new Error('Database not initialized');

    await this.promiser('exec', {
      dbId: this.dbId,
      sql: `
        CREATE TABLE IF NOT EXISTS detections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME NOT NULL,
          image_data TEXT,
          detections_json TEXT NOT NULL
        )
      `
    });
    console.log('Tables created successfully');
  }

  async saveDetection(timestamp, detections, imageData) {
    if (!this.promiser || !this.dbId) throw new Error('Database not initialized');
    
    await this.promiser('exec', {
      dbId: this.dbId,
      sql: 'INSERT INTO detections (timestamp, detections_json, image_data) VALUES (?, ?, ?)',
      bind: [timestamp, JSON.stringify(detections), imageData || null]
    });

    // Enforce 1000 limit
    await this.promiser('exec', {
      dbId: this.dbId,
      sql: `
        DELETE FROM detections 
        WHERE id NOT IN (
          SELECT id FROM detections ORDER BY timestamp DESC LIMIT 1000
        )
      `
    });
  }

  async getDetections(limit = 1000) {
    if (!this.promiser || !this.dbId) throw new Error('Database not initialized');

    const results = [];
    await this.promiser('exec', {
      dbId: this.dbId,
      sql: 'SELECT id, timestamp, image_data, detections_json FROM detections ORDER BY timestamp DESC LIMIT ?',
      bind: [limit],
      callback: (result) => {
        if (result.row) {
          results.push({
            id: result.row[0],
            timestamp: result.row[1],
            imagePath: result.row[2], // we map image_data to imagePath in dashboard
            detections: JSON.parse(result.row[3] || '[]')
          });
        }
      }
    });
    return results;
  }

  async deleteDetections(ids) {
    if (!this.promiser || !this.dbId) throw new Error('Database not initialized');
    if (!ids || ids.length === 0) return;

    const placeholders = ids.map(() => '?').join(',');
    await this.promiser('exec', {
      dbId: this.dbId,
      sql: `DELETE FROM detections WHERE id IN (${placeholders})`,
      bind: ids
    });
  }
}

window.dbManager = new DatabaseManager();
