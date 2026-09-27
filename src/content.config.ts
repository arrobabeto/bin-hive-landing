import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { homeSchema } from './lib/home-schema';

// Landing copy: one YAML file per locale (entry id = locale).
// These files are the Git source of truth referenced by
// binflow/surface-inventory.yaml (BSI, astro-repo profile).
const home = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/home' }),
  schema: homeSchema,
});

const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string().min(1).max(60),
    description: z.string().min(80).max(160),
    updated: z.string().min(1),
  }),
});

export const collections = { home, legal };
