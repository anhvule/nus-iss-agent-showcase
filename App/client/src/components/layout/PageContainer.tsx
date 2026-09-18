import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';

/**
 * Page container (FR-008): the primary <main> landmark that wraps page content
 * with consistent vertical rhythm and width. Referenced by the layout's skip
 * link (`id="main-content"`).
 */
export function PageContainer({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <main id="main-content" className="flex-1 py-10">
      <Container>{children}</Container>
    </main>
  );
}
