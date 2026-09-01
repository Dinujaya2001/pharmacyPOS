import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterStaffModal from './RegisterStaffModal';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  FileText, 
  LogOut, 
  UserPlus,
  Activity
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showStaffModal, setShowStaffModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Roles අනුව Navigation Items අර්ථ දැක්වීම
  const allNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { to: '/pos', label: 'POS Cashier', icon: ShoppingCart, roles: ['ADMIN', 'CASHIER', 'PHARMACIST'] },
    { to: '/inventory', label: 'Inventory', icon: Package, roles: ['ADMIN', 'PHARMACIST'] },
    { to: '/suppliers', label: 'Suppliers & GRN', icon: Truck, roles: ['ADMIN'] },
    { to: '/prescriptions', label: 'Prescriptions', icon: FileText, roles: ['ADMIN', 'PHARMACIST'] },
  ];

  // දැනට Login වී සිටින User ගේ Role එකට ගැළපෙන Menus පමණක් Filter කිරීම
  const visibleNavItems = allNavItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-slate-800">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide leading-none">PharmaPOS</h1>
              <span className="text-[10px] text-slate-400">Management System</span>
            </div>
          </div>

          {/* Role-filtered Navigation Links */}
          <nav className="space-y-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (User Info & Actions) */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          {/* Admin Only - Register Staff Button */}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowStaffModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700 shadow-sm mb-2"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Register Staff</span>
            </button>
          )}

          {/* User Profile Card */}
          <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                {user?.username?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="font-semibold text-xs text-white truncate">{user?.username || 'User'}</p>
                <p className="text-[10px] text-emerald-400 font-medium">{user?.role || 'STAFF'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

      {/* Register Staff Modal */}
      <RegisterStaffModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
      />
    </div>
  );
}