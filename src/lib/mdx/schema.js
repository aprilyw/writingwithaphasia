// Zod schema for story frontmatter
const { z } = require('zod');

// Coordinates are [longitude, latitude]
const CoordinatesSchema = z.tuple([z.number(), z.number()]);

const StoryFrontmatterSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  name: z.string().optional(),
  location: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
  date: z.string().optional(), // ISO preferred
  tags: z.array(z.string()).optional(),
  hero: z.string().optional(),
  status: z.enum(['published', 'draft']).optional().default('published'),
  excerpt: z.string().optional()
});

module.exports = { StoryFrontmatterSchema };
