import { Container } from '@/components/ui/Container';

/**
 * Site footer (FR-008): secondary information and the synthetic-data / demo
 * notice, in a semantic <footer> landmark.
 */
export function Footer(): React.JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <Container className="flex flex-col gap-2 py-6 text-sm text-slate-500">
        <p className="font-medium text-slate-700">EduAgent Connect</p>
        <p>
          An original demonstration website exploring how an education platform can become
          Agent Ready. All content and data are synthetic. This is not affiliated with,
          and does not integrate with, any real institution.
        </p>
        <p>© {year} EduAgent Connect — demonstration prototype.</p>
      </Container>
    </footer>
  );
}
