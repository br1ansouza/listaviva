import { Loader2 } from 'lucide-react';
import { domAnimation, LazyMotion } from 'motion/react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/features/lists/HomePage';

const CreateListPage = lazy(() =>
  import('@/features/lists/CreateListPage').then((module) => ({ default: module.CreateListPage })),
);
const ListPage = lazy(() =>
  import('@/features/lists/ListPage').then((module) => ({ default: module.ListPage })),
);
const LiveRoomPage = lazy(() =>
  import('@/features/lists/LiveRoomPage').then((module) => ({ default: module.LiveRoomPage })),
);
const HistoryPage = lazy(() =>
  import('@/features/lists/HistoryPage').then((module) => ({ default: module.HistoryPage })),
);
const Toaster = lazy(() =>
  import('@/components/ui/sonner').then((module) => ({ default: module.Toaster })),
);
const NotFoundPage = lazy(() =>
  import('@/features/lists/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

function RouteFallback() {
  return (
    <div className="grid place-items-center pt-24 text-ink-faint">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

export function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <BrowserRouter>
        <AppShell>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/nova" element={<CreateListPage />} />
              <Route path="/lista/:id" element={<ListPage />} />
              <Route path="/l/:token" element={<LiveRoomPage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AppShell>
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </BrowserRouter>
    </LazyMotion>
  );
}
