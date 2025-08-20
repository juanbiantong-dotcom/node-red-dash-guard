import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default Login;