import { useLocation, useOutletContext } from "react-router-dom";
import playStyles from "../styles/play.module.css";
import { useState } from "react";
import axios from "axios";
import { API_LINK } from "../utl/constants";

API_LINK;
function Play() {
  const location = useLocation();
  const scene = location.state?.scene;
  const [circle, setCircle] = useState([]);
  const [guess, setGuess] = useState([]);
  const { loading, setLoading, error, setError } = useOutletContext();

  const handleClickScene = (e) => {
    const imageRectangle = e.target.getBoundingClientRect();
    console.log(imageRectangle);
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const x = e.pageX;
    const y = e.pageY;
    const x_guess = e.clientX - imageRectangle.left + scrollX;
    const y_guess = e.clientY - imageRectangle.top + scrollY;
    setGuess({ x_guess, y_guess });

    console.log(guess);
    setCircle({ x, y });
  };

  //Youre working on this. You need to make it so the guess is evaluated

  const handleClickGuess = async (e) => {
    try {
      const scenesFromDB = await axios.post(`${API_LINK}/evaluateGuess`, {
        xcord: guess.x_guess,
        ycord: guess.y_guess,
      });
      console.log(scenesFromDB);

      //i think the easiest thing would be to flash the screen red if youre incorrect and
      //flash it green if youre right
      
      if(scenesFromDB === false)
      {

      }else if(scenesFromDB === true)
      {

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
  return (
    <div className={playStyles.sceneWrapper}>
      <div className={playStyles.charactersContainer}>
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
      </div>
      <img
        src={scene.url}
        alt="scene"
        className={playStyles.scene}
        onClick={handleClickScene}
      />
      {circle.x !== undefined && circle.y !== undefined && (
        <>
          {" "}
          <div
            className={playStyles.clickCircle}
            style={{ left: circle.x - 25 + "px", top: circle.y - 25 + "px" }}
          ></div>
          <div
            className={playStyles.submitGuess}
            style={{ left: circle.x + 25 + "px", top: circle.y - 100 + "px" }}
          >
            <div className={playStyles.submitYes}>Sumbit Guess</div>
            <div className={playStyles.submitNo} onClick={handleClickCancel}>
              Cancel
            </div>
          </div>
        </>
      )}
      {/* <div
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
