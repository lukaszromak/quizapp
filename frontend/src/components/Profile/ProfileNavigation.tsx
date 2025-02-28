import { Link } from "react-router-dom";

function ProfileNavigation() {
  return (
    <>
      <Link to="/user/changePassword">Change password</Link>
      <Link to="/user/quizzes">Quizzes</Link>
      <Link to="/user/solvedQuizzes">Solved quizzes</Link>
    </>
  )
}

export default ProfileNavigation