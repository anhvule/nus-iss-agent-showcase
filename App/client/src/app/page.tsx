'use client';

import { useEffect, useState } from 'react';
import { createBrowserTransport, resolveApiBaseUrl } from '@/lib/webmcp';

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
}

type HealthState =
  | { phase: 'loading' }
  | { phase: 'ok'; data: HealthResponse }
  | { phase: 'error'; message: string };

export default function HomePage(): React.JSX.Element {
  const [health, setHealth] = useState<HealthState>({ phase: 'loading' });

  useEffect(() => {
    const transport = createBrowserTransport({ baseUrl: resolveApiBaseUrl() });
    let active = true;

    transport
      .read<HealthResponse>('/api/health')
      .then((data) => {
        if (active) setHealth({ phase: 'ok', data });
      })
      .catch((err: unknown) => {
        if (active) {
          setHealth({
            phase: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-600">
          Foundation ready
        </p>
        <h1 className="text-3xl font-bold text-slate-900">EduAgent Connect</h1>
        <p className="text-slate-600">
          A prototype exploring how an education website can become Agent Ready
          through a WebMCP-style capability layer. Business features are not yet
          implemented — this is the repository foundation.
        </p>
      </header>

      <section
        aria-live="polite"
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Backend health
        </h2>
        {health.phase === 'loading' && (
          <p className="text-slate-500">Checking API…</p>
        )}
        {health.phase === 'error' && (
          <p className="text-red-600">
            Could not reach the API. Ensure the server is running. ({health.message})
          </p>
        )}
        {health.phase === 'ok' && (
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium text-emerald-600">{health.data.status}</dd>
            <dt className="text-slate-500">Service</dt>
            <dd className="text-slate-800">{health.data.service}</dd>
            <dt className="text-slate-500">Version</dt>
            <dd className="text-slate-800">{health.data.version}</dd>
            <dt className="text-slate-500">Uptime (s)</dt>
            <dd className="text-slate-800">{health.data.uptimeSeconds}</dd>
          </dl>
        )}
      </section>
    </main>
  );
}
