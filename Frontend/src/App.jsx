import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import TicketList from "./pages/TicketList";
import TicketDetail from "./pages/TicketDetail";
import AllTickets from "./pages/AllTickets";
import AgentPerformance from "./pages/AgentPerformance";
import AssignTickets from "./pages/AssignTicket";
import PersistLogin from "./components/PersistLogin";
import PublicRoute from "./components/PublicRoute";
function App() {
  return (
    <Routes>
      <Route element={<PersistLogin />}>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/create" element={<CreateTicket />} />
            <Route path="/tickets/:ticketId" element={<TicketDetail />} />

            {/* Admin Only Routes */}
            <Route path="/admin/assign" element={<AssignTickets />} />
            <Route path="/admin/tickets" element={<AllTickets />} />
            <Route path="/admin/performance" element={<AgentPerformance />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
