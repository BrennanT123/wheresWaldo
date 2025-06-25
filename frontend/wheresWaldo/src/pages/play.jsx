import { useLocation, useOutletContext } from "react-router-dom";
import playStyles from "../styles/play.module.css";
import { useState, useEffect } from "react";
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

  async function initializeScene() {
    try {
      setLoading(true);
      const response = await axios.post(`${API_LINK}/postCurrentGame`, {
        sceneid: pickedScene?.id || null,
      });

      const currentGame = response.data.currentGame;

      if (!response.data.gameAlreadyRunning) {
        await axios.post(`${API_LINK}/startGame`);
      }
      console.log(currentGame.scene);
      setScene(currentGame.scene);
      setIncorrectGuesses(currentGame.incorrectGuesses);
      setCharactersFound(
        currentGame.characterFinds.map((found) => found.characterId)
      );
      setCharacters(currentGame.scene.characters);
      setLoading(false);
    } catch (err) {
      console.error("error while starting game");
      const messages =
        err.response?.data?.errors?.map((e) => e.msg).join("\n") ||
        "unexpected error occured";
      console.log(err);
      setError(messages);
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
    console.log(x_guess, y_guess);
    setGuess({ x_guess, y_guess });
    setCircle({ x: e.pageX, y: e.pageY });
  };

  //Youre working on this. You need to make it so the guess is evaluated

  const handleClickGuess = async (e) => {
    try {
      console.log("x_guess:", guess.x_guess, "y_guess:", guess.y_guess);
      const evaluatedGuess = await axios.post(`${API_LINK}/evaluateGuess`, {
        xcord: guess.x_guess,
        ycord: guess.y_guess,
      });

      //i think the easiest thing would be to flash the screen red if youre incorrect and
      //flash it green if youre right

      if (evaluatedGuess.data.correct === false) {
        console.log("incorrect");
        setIncorrectGuesses(incorrectGuesses + 1);
      } else if (evaluatedGuess.data.correct === true) {
        if (evaluatedGuess.data.alreadyFound) {
          console.log("character already found");
          setIncorrectGuesses(incorrectGuesses + 1);
        } else {
          console.log("correct");
          setCharactersFound([
            ...charactersFound,
            evaluatedGuess.data.characterFound,
          ]);
          const gameOverCheck = await axios.get(`${API_LINK}/checkEndgame`);
          if (gameOverCheck.data.gameOver) {
            setIsGameOver(true);
            console.log("game over");
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
      console.log(err);
      setError(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleClickCancel = () => {
    setCircle({});
    setGuess({});
  };

  if (error) return <Error state={{ error }} />;
  if (loading || !scene) return <Loading />;

  return (
    <div className={playStyles.sceneWrapper}>
      {isGameOver && (
        <div className={playStyles.gameOverOverlay}>
          <div className={playStyles.gameOverContent}>
            <h1>Game Over!</h1>
            {}
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
