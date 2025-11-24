import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Apply = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page as public applications are disabled
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default Apply;
