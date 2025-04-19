
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import HomePage from "./HomePage";
import EntriesPage from "./EntriesPage";
import VendorsPage from "./VendorsPage";
import ReportsPage from "./ReportsPage";
import SettingsPage from "./SettingsPage";

const AppContent = () => {
  const location = useLocation();
  
  // Render the appropriate component based on the current route
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === "/entries") {
      return <EntriesPage />;
    } else if (path === "/vendors") {
      return <VendorsPage />;
    } else if (path === "/reports") {
      return <ReportsPage />;
    } else if (path === "/settings") {
      return <SettingsPage />;
    } else {
      return <HomePage />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
      <NavBar />
    </div>
  );
};

const Index = () => {
  return <AppContent />;
};

export default Index;
