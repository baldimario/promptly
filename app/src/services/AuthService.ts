import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export class AuthService {
  static async requireUser() {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; email?: string } | undefined;
    if (!user?.id && !user?.email) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    return user;
  }

  static async optionalUser() {
    const session = await getServerSession(authOptions);
    return (session?.user as { id?: string; email?: string } | undefined) || null;
  }
}
