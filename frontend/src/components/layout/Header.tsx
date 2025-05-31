
import { useState } from 'react';
import { LogOut, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { logout } from '@/utils/api';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  onLogout: () => {};
  userEmail?: string;
}

export const Header = ({ onLogout, userEmail }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Expense-ify
              </h1>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{userEmail}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await logout();
                  toast({ title: "Logged out", description: "See you soon!" });
                  window.location.href = "/"; // or login page
                } catch (err) {
                  toast({ title: "Error", description: "Logout failed", variant: "destructive" });
                }
              }}

              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600 px-2">
                <User className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2 justify-center hover:bg-red-50 hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
