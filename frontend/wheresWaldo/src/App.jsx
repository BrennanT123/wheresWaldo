import { useState } from "react";
import { Outlet } from "react-router-dom";
import mainStyles from "./styles/mainStyles.module.css";
import axios from "axios";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  axios.defaults.withCredentials = true;

  return (
    <div className={mainStyles.websiteContainer}>
      <Outlet
        context={{
          loading,
          setLoading,
          error,
          setError,
        }}
      />
    </div>
  );
}

export default App;
