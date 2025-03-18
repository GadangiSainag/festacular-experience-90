
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bell, User, Calendar, MapPin } from "lucide-react";

interface HeaderProps {
  scrolled: boolean;
}

const Header = ({ scrolled }: HeaderProps) => {
  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-350 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xl font-medium text-primary flex items-center"
        >
          <span className="bg-primary text-white px-2 py-1 rounded-md mr-1">Next</span>
          <span>Fest</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" exact>Events</NavLink>
          <NavLink to="/map">Map</NavLink>
          <NavLink to="/timeline">Schedule</NavLink>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          
          <Link 
            to="/profile" 
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
            aria-label="Profile"
          >
            <User className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

interface NavLinkProps {
  to: string;
  exact?: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, exact, children }: NavLinkProps) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const pathname = window.location.pathname;
    if (exact) {
      setIsActive(pathname === to);
    } else {
      setIsActive(pathname.startsWith(to));
    }
  }, [to, exact]);
  
  return (
    <Link 
      to={to} 
      className={`relative py-1 font-medium transition-colors ${
        isActive ? "text-primary" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
      {isActive && (
        <motion.div 
          className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full"
          layoutId="navIndicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  );
};

export default Header;
