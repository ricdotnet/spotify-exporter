const crypto = require('crypto');

module.exports = class Sessions {
  constructor() {
    this.sessions = new Map();
  }

  add(id) {
    if (this.sessions.has(id)) return;
    this.sessions.set(id, {});
  }

  get(id) {
    return this.sessions.get(id);
  }

  update(id, data) {
    this.sessions.set(id, data);
  }

  remove(id) {
    if (!id) return console.log('no id');
    this.sessions.delete(id);
  }

  generateKey() {
    return crypto.randomBytes(16).toString('hex');
  }
}
