import { prisma } from '../src/lib/prisma';

// Curated initial models
const models = [
  { name: 'GPT-5', slug: 'gpt-5', provider: 'OpenAI', description: 'Next-generation GPT-5 model' },
  { name: 'GPT-4o', slug: 'gpt-4o', provider: 'OpenAI', description: 'Omni GPT-4 optimized' },
  { name: 'GPT-4 Turbo', slug: 'gpt-4-turbo', provider: 'OpenAI', description: 'Turbo variant of GPT-4' },
  { name: 'Gemini 1.5 Pro', slug: 'gemini-1.5-pro', provider: 'Google', description: 'High capability Gemini' },
  { name: 'Gemini 1.5 Flash', slug: 'gemini-1.5-flash', provider: 'Google', description: 'Fast Gemini variant' },
  { name: 'Claude 3 Opus', slug: 'claude-3-opus', provider: 'Anthropic', description: 'Claude 3 highest capability' },
  { name: 'Claude 3 Sonnet', slug: 'claude-3-sonnet', provider: 'Anthropic', description: 'Claude 3 balanced' },
  { name: 'Claude 3 Haiku', slug: 'claude-3-haiku', provider: 'Anthropic', description: 'Claude 3 fast, lightweight' },
  { name: 'Mistral Large', slug: 'mistral-large', provider: 'Mistral', description: 'Large Mistral model' },
  { name: 'Mistral Small', slug: 'mistral-small', provider: 'Mistral', description: 'Small Mistral model' },
  { name: 'Llama 3', slug: 'llama-3', provider: 'Meta', description: 'Llama 3 open model' }
];

async function main() {
  for (const m of models) {
    try {
      // @ts-expect-error model delegate exists after migration
      await prisma.model.upsert({
        where: { slug: m.slug },
        update: { description: m.description },
        create: m
      });
      console.log(`Seeded model ${m.slug}`);
    } catch (e) {
      console.warn('Skipping model (maybe table missing):', m.slug, e);
    }
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
