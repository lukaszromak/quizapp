import StyledLink from "components/Misc/StyledLink"

function ProfileNavigation() {
  return (
    <>
      <StyledLink to="/user/changePassword">Change password</StyledLink>
      <StyledLink to="/user/quizzes">Quizzes</StyledLink>
      <StyledLink to="/user/solvedQuizzes">Solved quizzes</StyledLink>
    </>
  )
}

export default ProfileNavigation