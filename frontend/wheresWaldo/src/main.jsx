import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Error from "./pages/error";

import App from "./App.jsx";
import Home from "./pages/home.jsx";
import SelectScene from "./pages/selectScene.jsx";
import Play from "./pages/play.jsx";
import axios from "axios";

axios.defaults.withCredentials = true;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "selectScene", element: <SelectScene /> },
      {path: "play", element: <Play />}
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </StrictMode>
);
