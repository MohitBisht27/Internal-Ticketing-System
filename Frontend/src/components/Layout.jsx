import { useState, useEffect } from "react"; // Added useEffect
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// Make sure this path points to where you saved the API file (e.g., ../features/api/authApi)
import { useLogoutMutation } from "../features/authSlice/authApiSlice";
import { logout, selectCurrentUser } from "../features/authSlice/authSlice";
import {
  Menu,
  X,
  Home,
  Ticket,
  PlusCircle,
  Users,
  BarChart3,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Settings,
  UserPlus,
} from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clean up client state even if server fails
      dispatch(logout());
      navigate("/login");
    }
  };

  // Safe Event Listener with Cleanup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".user-menu-button") &&
        !event.target.closest(".user-menu-dropdown")
      ) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["employee", "agent", "admin"],
    },
    {
      name: "My Tickets",
      href: "/tickets",
      icon: Ticket,
      roles: ["employee", "agent"],
    },
    {
      name: "Create Ticket",
      href: "/tickets/create",
      icon: PlusCircle,
      roles: ["employee"],
    },
    {
      name: "All Tickets",
      href: "/admin/tickets",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Assign Tickets",
      href: "/admin/assign",
      icon: UserPlus,
      roles: ["admin"],
    },
    {
      name: "Agent Performance",
      href: "/admin/performance",
      icon: BarChart3,
      roles: ["admin"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || ""),
  );

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Ticket className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TicketHub</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive(item.href) ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:ml-0" />

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="user-menu-button flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* User Avatar Logic: Image or Initials */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || "Guest"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="user-menu-dropdown absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
