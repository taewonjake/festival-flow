import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MobileLayout from './components/layout/MobileLayout';

// Student Pages
import StudentMain from './pages/student/StudentMain';
import WaitingForm from './pages/student/WaitingForm';
import StudentLogin from './pages/student/StudentLogin';
import StatusDashboard from './pages/student/StatusDashboard';
import QRTicket from './pages/student/QRTicket';
import ChatRoom from './pages/student/ChatRoom';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import TableManagement from './pages/admin/TableManagement';
import QueueManagement from './pages/admin/QueueManagement';
import AdminChatCenter from './pages/admin/AdminChatCenter';
import QrScanner from './pages/admin/QrScanner';

// QueryClient 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Student Routes - MobileLayout 적용 */}
          <Route path="/student" element={
            <MobileLayout>
              <Navigate to="/student/main" replace />
            </MobileLayout>
          } />
          <Route path="/student/main" element={
            <MobileLayout>
              <StudentMain />
            </MobileLayout>
          } />
          <Route path="/student/apply" element={
            <MobileLayout>
              <WaitingForm />
            </MobileLayout>
          } />
          <Route path="/student/waiting" element={
            <MobileLayout>
              <WaitingForm />
            </MobileLayout>
          } />
          <Route path="/student/login" element={
            <MobileLayout>
              <StudentLogin />
            </MobileLayout>
          } />
          <Route path="/student/status" element={
            <MobileLayout>
              <StatusDashboard />
            </MobileLayout>
          } />
          <Route path="/student/qr" element={
            <MobileLayout>
              <QRTicket />
            </MobileLayout>
          } />
          <Route path="/student/chat/:chatRoomId" element={
            <MobileLayout>
              <ChatRoom />
            </MobileLayout>
          } />

          {/* Admin Routes - MobileLayout 미적용 (AdminLayout이 자체 레이아웃 제공) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tables" element={<TableManagement />} />
          <Route path="/admin/waitings" element={<QueueManagement />} />
          <Route path="/admin/chat" element={<AdminChatCenter />} />
          <Route path="/admin/qr-scanner" element={<QrScanner />} />

          {/* Default Route */}
          <Route path="/" element={
            <MobileLayout>
              <Navigate to="/student/main" replace />
            </MobileLayout>
          } />
          <Route path="*" element={
            <MobileLayout>
              <Navigate to="/student/main" replace />
            </MobileLayout>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
