const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

module.exports = class SessionManager {
  constructor (options = {}) {
    if (SessionManager.instance) {
      return SessionManager.instance;
    }

    if (options.storage !== undefined && options.storage !== 'memory' && options.storage !== 'file') {
      throw new Error('Session storage can only be memory or file');
    }

    this.options = {
      storage: options.storage || 'memory',
    };

    if (this.options.storage === 'memory') {
      this.sessions = new Map();
    }

    SessionManager.instance = this;

    return this;
  }

  static getInstance () {
    return SessionManager.instance;
  }

  async create (id) {
    if (this.options.storage === 'file') {
      const defaultData = {
        created: Date.now(),
      }

      return fs.writeFile(this.buildFilePath(id), JSON.stringify(defaultData));
    }
    if (this.sessions.has(id)) return;
    this.sessions.set(id, {});
  }

  async get (id) {
    if (this.options.storage === 'file') {
      return fs.readFile(this.buildFilePath(id), 'utf-8');
    }
    return this.sessions.get(id);
  }

  async add (id, partial) {
    const filePath = this.buildFilePath(id);

    const buffer = await fs.readFile(filePath);
    let json = JSON.parse(buffer.toString());
    json = { ...json, ...partial }
    return fs.writeFile(filePath, JSON.stringify(json));
  }

  // this will rewrite the session completely
  async update (id, data) {
    if (this.options.storage === 'file') {
      const filePath = this.buildFilePath(id);

      // const buffer = await fs.readFile(filePath);
      // let json = JSON.parse(buffer.toString());
      // json = { ...json, ...data }
      return fs.writeFile(filePath, JSON.stringify(data));
    }

    this.sessions.set(id, data);
  }

  async remove (id) {
    if (!id) return console.log('no id');

    if (this.options.storage === 'file') {
      return fs.rm(this.buildFilePath(id));
    }

    this.sessions.delete(id);
  }

  buildFilePath (id) {
    return path.join(process.cwd(), 'server', 'sessions', `session_${id}.json`);
  }

  static generateKey () {
    return crypto.randomBytes(16).toString('hex');
  }
}
