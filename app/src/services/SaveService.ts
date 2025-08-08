import prisma from '@/lib/prisma';

export class SaveService {
  static async isSaved(userId: string | null | undefined, promptId: string | null | undefined): Promise<boolean> {
    if (!userId || !promptId) return false;
    const existing = await prisma.savedPrompt.findUnique({
      where: { userId_promptId: { userId, promptId } },
      select: { promptId: true },
    });
    return !!existing;
  }

  static async toggle(params: { userId: string; promptId: string; action: 'save' | 'unsave' }) {
    const { userId, promptId, action } = params;

    const prompt = await prisma.prompt.findUnique({ where: { id: promptId }, select: { id: true } });
    if (!prompt) throw new Error('Prompt not found');

    if (action === 'save') {
      const existing = await prisma.savedPrompt.findUnique({ where: { userId_promptId: { userId, promptId } } });
      if (!existing) {
        await prisma.savedPrompt.create({ data: { userId, promptId } });
      }
    } else {
      await prisma.savedPrompt.delete({ where: { userId_promptId: { userId, promptId } } });
    }

    const saveCount = await prisma.savedPrompt.count({ where: { promptId } });
    const isSaved = await this.isSaved(userId, promptId);
    return { isSaved, saveCount };
  }

  static async count(promptId: string) {
    return prisma.savedPrompt.count({ where: { promptId } });
  }

  static async listSavedPromptIds(userId: string | null | undefined): Promise<string[]> {
    if (!userId) return [];
    const rows = await prisma.savedPrompt.findMany({ where: { userId }, select: { promptId: true } });
    return rows.map((r) => r.promptId);
  }

  static async countForUser(userId: string | null | undefined): Promise<number> {
    if (!userId) return 0;
    return prisma.savedPrompt.count({ where: { userId } });
  }
}
