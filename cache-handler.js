const fs = require('fs');
const path = require('path');

module.exports = class CacheHandler {
  constructor(options) {
    this.dir = path.join(process.cwd(), '.next/cache');
    this.options = options;
  }

  async get(key) {
    try {
      const data = await fs.promises.readFile(
        path.join(this.dir, key),
        'utf8'
      );
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async set(key, data) {
    try {
      await fs.promises.mkdir(this.dir, { recursive: true });
      await fs.promises.writeFile(
        path.join(this.dir, key),
        JSON.stringify(data)
      );
    } catch {
      // Handle errors if needed
    }
  }
}