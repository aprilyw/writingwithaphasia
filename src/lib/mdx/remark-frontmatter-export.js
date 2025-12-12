// remark-frontmatter-export: converts YAML frontmatter to an exported ESM const `frontmatter`
// Inspired by common MDX patterns; avoids relying on remark-mdx-frontmatter to reduce preset issues.
const yaml = require('js-yaml');

function remarkFrontmatterExport() {
  return (tree, file) => {
    const { children } = tree;
    if (!Array.isArray(children)) return;
    const yamlNodeIndex = children.findIndex((n) => n.type === 'yaml');
    if (yamlNodeIndex === -1) return;
    const yamlNode = children[yamlNodeIndex];
    try {
      const data = yaml.load(yamlNode.value) || {};
      // Attach to vfile for potential downstream consumption
      file.data.frontmatter = data;
      // Inject an MDX ESM export so pages can import { frontmatter }
      children.splice(yamlNodeIndex + 1, 0, {
        type: 'mdxjsEsm',
        value: `export const frontmatter = ${JSON.stringify(data)};`,
        data: { estree: null }
      });
    } catch (err) {
      file.fail('Failed to parse frontmatter YAML: ' + err.message);
    }
  };
}

module.exports = remarkFrontmatterExport;
