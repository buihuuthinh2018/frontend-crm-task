import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, ListTodo } from 'lucide-react';

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">CRM Task Manager</h1>
              <nav className="flex space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/tasks"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <ListTodo className="h-4 w-4" />
                  <span>Tasks</span>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
