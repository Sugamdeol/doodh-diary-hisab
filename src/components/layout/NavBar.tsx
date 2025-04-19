
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Calendar, Home, Layers, Settings, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const NavBar = () => {
  const location = useLocation();
  
  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/entries", label: "Entries", icon: Calendar },
    { to: "/vendors", label: "Vendors", icon: Truck },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between items-center px-2 py-1 sm:p-2 z-10">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
              isActive 
                ? "text-milk-600 bg-milk-50" 
                : "text-gray-500 hover:text-milk-500 hover:bg-milk-50"
            )}
          >
            <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default NavBar;
