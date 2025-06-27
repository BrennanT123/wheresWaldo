import Error from "./error";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useFetchCurrentGame } from "../utl/hooks";
import { useNavigate } from "react-router-dom";
import Loading from "./loading";
import { useEffect } from "react";
import axios from "axios";
import { API_LINK } from "../utl/constants";
//this page will be used to determine if a game is running. If a game is running the user will be returned to the game
//if the page is not running then the user will be returned to the select scene page
function Home() {
  const { loading, setLoading, error, setError } = useOutletContext();
  const isGameRunning = useFetchCurrentGame(setLoading, setError);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isGameRunning === null || loading) return;

    if (isGameRunning.gameRunning === true) {
      navigate("/play");
    } else if (isGameRunning.gameRunning === false) {
      navigate("/selectScene");
    } else {
      console.log("Unexpected response", isGameRunning);
    }
  }, [isGameRunning, loading, navigate]);

  if (error) {
    return <Error />;
  }

  if (loading || isGameRunning === null) {
    return <Loading />;
  }

  return <span>Game check complete</span>;
}

export default Home;
