const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: (process.env.CACHE_EXPIRY_HOURS || 24) * 3600 });

module.exports = {
  get(key) {
    return cache.get(key);
  },
  set(key, value) {
    return cache.set(key, value);
  },
  del(key) {
    return cache.del(key);
  },
  flush() {
    return cache.flushAll();
  }
};
