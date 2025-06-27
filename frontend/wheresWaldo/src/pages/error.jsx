import { Link } from "react-router-dom";
import errorStyles from "../styles/error.module.css";
import { useLocation } from "react-router-dom";
function Error() {
  const location = useLocation();
  const error = location.state?.error;

  if (error) {
    return (
      <main>
        <h1 className={errorStyles.errorHeader}>{error.message}</h1>
        <div className={errorStyles.linkContainer}>
          <Link to="/"> Home </Link>
        </div>
      </main>
    );
  }
  return (
    <main>
      <h1 className={errorStyles.errorHeader}>404 Page Not Found</h1>
      <div className={errorStyles.linkContainer}>
        <Link to="/"> Home </Link>
      </div>
    </main>
  );
}

export default Error;
