import {
  useLocation,
  useOutletContext,
  useNavigate,
  Link,
} from "react-router-dom";
import playStyles from "../styles/play.module.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_LINK } from "../utl/constants";
import Loading from "./loading";
import Error from "./error";
API_LINK;
function Play() {
  const location = useLocation();
  const pickedScene = location.state?.scene || null;
  const [scene, setScene] = useState();
  const [circle, setCircle] = useState([]);
  const [guess, setGuess] = useState([]);
  const { loading, setLoading, error, setError } = useOutletContext();
  const [characters, setCharacters] = useState();
  const [charactersFound, setCharactersFound] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [score, setScore] = useState(0);

  const [leaderboard, setLeaderboard] = useState();
  const [playerRanking, setPlayerRanking] = useState();

  const isInitializing = useRef(false);
  const isGuessing = useRef(false);
  const isUpdatingLeaderboard = useRef(false);

  const navigate = useNavigate();

  async function initializeScene() {
    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      setLoading(true);
      const response = await axios.post(`${API_LINK}/postCurrentGame`, {
        sceneid: pickedScene?.id || null,
      });

      if (response.data.noSceneSelected === true || response.data.noSession) {
        navigate("/");
        return;
      }

      const currentGame = response.data.currentGame;
      if (!response.data.gameAlreadyRunning) {
        await axios.post(`${API_LINK}/startGame`);
      }

      if (response.data.currentGame.endTime) {
        setIsGameOver(true);
      }

      setScene(currentGame.scene);
      setIncorrectGuesses(currentGame.incorrectGuesses);

      setCharactersFound(
        currentGame.characterFinds.map((found) => found.characterId)
      );
      setCharacters(currentGame.scene.characters);
    } catch (err) {
      console.error("error while starting game");
      const messages =
        err.response?.data?.errors?.map((e) => e.msg).join("\n") ||
        "unexpected error occured";
      setError(messages);
    } finally {
      setLoading(false);
      isInitializing.current = false;
    }
  }

  useEffect(() => {
    initializeScene();
  }, []);

  const handleClickScene = (e) => {
    const img = e.target;
    const offsetX = e.pageX - img.offsetLeft;
    const offsetY = e.pageY - img.offsetTop;
    const scaleX = img.naturalWidth / img.offsetWidth;

    const scaleY = img.naturalHeight / img.offsetHeight;
    const x_guess = Math.round(offsetX * scaleX);
    const y_guess = Math.round(offsetY * scaleY);
    setGuess({ x_guess, y_guess });
    setCircle({ x: e.pageX, y: e.pageY });
  };

  //Youre working on this. You need to make it so the guess is evaluated

  const handleClickGuess = async () => {
    if (isGuessing.current) return;
    isGuessing.current = true;

    try {
      const evaluatedGuess = await axios.post(`${API_LINK}/evaluateGuess`, {
        xcord: guess.x_guess,
        ycord: guess.y_guess,
      });

      if (evaluatedGuess.data.correct === false) {
        setIncorrectGuesses(incorrectGuesses + 1);
      } else if (evaluatedGuess.data.correct === true) {
        if (evaluatedGuess.data.alreadyFound) {
          setIncorrectGuesses(incorrectGuesses + 1);
        } else {
          setCharactersFound([
            ...charactersFound,
            evaluatedGuess.data.characterFound,
          ]);
          const gameOverCheck = await axios.get(`${API_LINK}/checkEndgame`);
          if (gameOverCheck.data.gameOver) {
            setIsGameOver(true);
            const endGame = await axios.post(`${API_LINK}/endGame`);
            const start = new Date(
              endGame.data.currentGame.startTime
            ).getTime();
            const end = new Date(endGame.data.currentGame.endTime).getTime();
            const tempScore = Math.round(
              10000 -
                (end - start) / 100 -
                50 * endGame.data.currentGame.incorrectGuesses
            ); //10000 - number of seconds passed*10 - 50*incorrect guesses
            setScore(tempScore);
          }
        }
      }
      setCircle({});
      setGuess({});
    } catch (err) {
      console.error("error while fetching scenes");
      const messages =
        err.response?.data?.errors?.map((e) => e.msg).join("\n") ||
        "unexpected error occured";
      setError(messages);
    } finally {
      isGuessing.current = false;
      setLoading(false);
    }
  };

  const handleClickCancel = () => {
    setCircle({});
    setGuess({});
  };

  const handleClickSubmitScore = async (e) => {
    e.preventDefault();
    if (isUpdatingLeaderboard.current) return;
    isUpdatingLeaderboard.current = true;
    try {
      setLoading(true);

      const formData = new FormData(e.target);
      const playerName = formData.get("name");

      const playerRanking = await axios.post(`${API_LINK}/updateLeaderboard`, {
        playerName,
      });
      const leaderboard = await axios.get(`${API_LINK}/leaderboard`);
      console.log(leaderboard);
      console.log(playerRanking);
      setLeaderboard(leaderboard.data);
      setPlayerRanking(playerRanking.data);
      await axios.delete(`${API_LINK}/deleteCurrentGame`);
    } catch (err) {
      const messages =
        err.response?.data?.errors?.map((e) => e.msg).join("\n") ||
        "unexpected error occured";
      setError(messages);
    } finally {
      isUpdatingLeaderboard.current = false;
      setLoading(false);
    }
  };

  if (error) return <Error state={{ error }} />;
  if (loading || !scene) return <Loading />;

  return (
    <div className={playStyles.sceneWrapper}>
      {isGameOver && (
        <div className={playStyles.gameOverOverlay}>
          <div className={playStyles.gameOverContent}>
            <h1>You Win!</h1>
            <div>Final Score: {score}</div>
            {!leaderboard && (
              <form
                onSubmit={handleClickSubmitScore}
                className={playStyles.submitScoreForm}
              >
                <input
                  type="text"
                  name="name"
                  id="nameInput"
                  className={playStyles.nameInput}
                  placeholder="Enter Name"
                  required
                />
                <button
                  type="submit"
                  className={playStyles.submitButton}
                  disabled={loading}
                >
                  {" "}
                  Submit Score
                </button>
              </form>
            )}
            {}
            {leaderboard && (
              <div className={playStyles.leaderboardContainer}>
                <h2>Leaderboard</h2>
                <table className={playStyles.leaderboardTable}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.topFive.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.rank}</td>
                        <td>{entry.playerName}</td>
                        <td>{entry.score}</td>
                      </tr>
                    ))}

                    {leaderboard &&
                      playerRanking.rank > 5 && (
                        <>
                          <tr className={playStyles.separatorRow}>
                            <td colSpan="3">...</td>
                          </tr>
                          <tr className={playStyles.currentPlayerRow}>
                            <td>{playerRanking.rank}</td>
                            <td>{playerRanking.playerName}</td>
                            <td>{playerRanking.score}</td>
                          </tr>
                        </>
                      )}
                  </tbody>
                </table>
                     <Link to="/"> Play again?</Link>
              </div>
            )}
          </div>
        </div>
      )}
      <div className={playStyles.gameInfoContainer}>
        <span className={playStyles.incorrectGuesses}>
          Incorrect Guesses: {incorrectGuesses}
        </span>
        <div className={playStyles.charactersContainer}>
          {Array.isArray(characters) &&
            scene.characters.map((character) => {
              return (
                <img
                  key={character.id}
                  className={`${playStyles.characterImg} ${
                    charactersFound.includes(character.id) &&
                    playStyles.charactersFound
                  }`}
                  src={character.url}
                  alt="Character to find"
                />
              );
            })}
        </div>
      </div>
      <div className={playStyles.sceneScrollContainer}>
        <img
          src={scene.url}
          alt="scene"
          className={playStyles.scene}
          onClick={handleClickScene}
        />
      </div>
      {circle.x !== undefined && circle.y !== undefined && (
        <>
          {" "}
          <div
            className={playStyles.clickCircle}
            style={{ left: circle.x - 75 + "px", top: circle.y - 75 + "px" }}
          ></div>
          <div
            className={playStyles.submitGuess}
            style={{ left: circle.x + 50 + "px", top: circle.y - 125 + "px" }}
            onClick={handleClickGuess}
          >
            <div className={playStyles.submitYes}>Sumbit Guess</div>
            <div className={playStyles.submitNo} onClick={handleClickCancel}>
              Cancel
            </div>
          </div>
        </>
      )}

      {/* Old guess container for when I wanted them to have to say what character they found. 
       <div
        className={playStyles.guessContainer}
        style={{ left: circle.x + 25 + "px", top: circle.y - 150 + "px" }}
      >
        {Array.isArray(scene.characters) &&
          scene.characters.map((character) => {
            return (
              <img
                key={character.id}
                className={playStyles.characterImg}
                src={character.url}
                alt="Character to find"
              />
            );
          })}
      </div> */}
    </div>
  );
}

export default Play;
