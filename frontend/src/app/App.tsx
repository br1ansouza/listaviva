import { BrowserRouter, Route, Routes } from 'react-router';

import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { CreateListPage } from '@/features/lists/CreateListPage';
import { HistoryPage } from '@/features/lists/HistoryPage';
import { HomePage } from '@/features/lists/HomePage';
import { ListPage } from '@/features/lists/ListPage';
import { LiveRoomPage } from '@/features/lists/LiveRoomPage';
import { NotFoundPage } from '@/features/lists/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nova" element={<CreateListPage />} />
          <Route path="/lista/:id" element={<ListPage />} />
          <Route path="/l/:token" element={<LiveRoomPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
      <Toaster />
    </BrowserRouter>
  );
}
