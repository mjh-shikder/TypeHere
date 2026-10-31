import type { DefaultSession } from 'next-auth';
import type {
  CursorStyle,
  FontSize,
  GlassTheme,
  MonospaceFont,
  WordBankSize,
} from '@/types/typing';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      theme?: GlassTheme;
      fontFamily?: MonospaceFont;
      fontSize?: FontSize;
      cursorStyle?: CursorStyle;
      wordBankSize?: WordBankSize;
    } & DefaultSession['user'];
  }
}
