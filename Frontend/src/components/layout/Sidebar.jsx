import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  BarChart3,
  List,
  Clock,
  Users,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const menuItems = {
    employee: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Create Ticket", path: "/tickets/create", icon: PlusCircle },
      { name: "My Tickets", path: "/tickets", icon: Ticket },
    ],
    agent: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Assigned Tickets", path: "/tickets", icon: Ticket },
    ],
    admin: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "All Tickets", path: "/admin/tickets", icon: List },
      {
        name: "Agent Performance",
        path: "/admin/performance",
        icon: BarChart3,
      },
      { name: "Overdue Tickets", path: "/admin/overdue", icon: Clock },
    ],
  };

  const links = menuItems[role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-20 h-full w-64 bg-white border-r border-gray-200 pt-16 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="px-4 py-6 h-full overflow-y-auto">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">
              Navigation
            </p>
          </div>
          <nav className="space-y-1">
            {links.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Info Card */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-sm font-medium opacity-90">Logged in as</p>
              <p className="font-semibold truncate">{user?.fullName}</p>
              <p className="text-xs opacity-75 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
