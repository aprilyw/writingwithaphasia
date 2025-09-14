const { getAllStoriesMeta } = require('./getStoriesMeta');

/**
 * Returns validated frontmatter meta for a single story id.
 * Throws if strict and not found / invalid.
 */
function getStoryMetaById(id, { strict = false } = {}) {
  const all = getAllStoriesMeta({ strict });
  return all.find(s => !s.error && (s.id === id));
}

module.exports = { getStoryMetaById };