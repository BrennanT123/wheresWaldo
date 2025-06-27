import Error from "./error";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useFetchCurrentGame } from "../utl/hooks";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { API_LINK } from "../utl/constants";
import Loading from "./loading";
import axios from "axios";
import selectSceneStyles from "../styles/selectScene.module.css";

//This page is used to select the scene that the user will be playing on
function SelectScene() {
  const { loading, setLoading, error, setError } = useOutletContext();
  const [scenes, setScenes] = useState(null);
  const isGameRunning = useFetchCurrentGame(setLoading, setError);
  const navigate = useNavigate();

  useEffect(() => {
    if (isGameRunning?.gameRunning === true) {
      navigate("/play");
      return;
    }
  }, [isGameRunning, navigate]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const getScenes = async () => {
      try {
        const scenesFromDB = await axios.get(`${API_LINK}/getScenes`);
        setScenes(scenesFromDB.data.scenes);
      } catch (err) {
        console.error("error while fetching scenes");
        const messages =
          err.response?.data?.errors?.map((e) => e.msg).join("\n") ||
          "unexpected error occured";
        console.log(err);
        setError(messages);
      } finally {
        setLoading(false);
      }
    };
    getScenes();
  }, []);

  if (error) return <Error state={{ error }} />;
  if (loading || !scenes) return <Loading />;

  return (
    <>
      <div className={selectSceneStyles.selectScenesContainer}>
        <h1 className={selectSceneStyles.pageTitle}>Choose Your Scene</h1>
        <p className={selectSceneStyles.credit}>
          Art from&nbsp;
          <a
            href="https://www.redbubble.com/people/zurgetron/shop"
            target="_blank"
            rel="noreferrer"
          >
            Zurgetron on Redbubble
          </a>
        </p>

        <div className={selectSceneStyles.scenesContainer}>
          {Array.isArray(scenes) &&
            scenes.map((scene) => {
              return (
                <Link
                  to="/play"
                  state={{ scene }}
                  key={scene.id}
                  className={selectSceneStyles.sceneCard}
                >
                  {" "}
                  <img src={scene.url} alt={`Scene ${scene.id}`} />
                  <div className={selectSceneStyles.sceneLabel}>
                    Scene #{scene.id}
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </>
  );
}

export default SelectScene;
