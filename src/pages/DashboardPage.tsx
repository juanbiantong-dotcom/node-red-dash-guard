import { useAuth } from "@/contexts/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const DashboardPage = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return <Dashboard onLogout={handleLogout} />;
};

export default DashboardPage;