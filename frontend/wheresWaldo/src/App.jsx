import { useState } from "react";
import {  Outlet } from "react-router-dom";
import mainStyles from "./styles/mainStyles.module.css"

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
