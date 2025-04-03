import StyledLink from "components/Misc/StyledLink"
import { genericContainerStyle, genericListItemStyle } from "components/Misc/Styles"
import { Typography } from "components/Misc/Typography"

function ProfileNavigation() {
  return (
    <div className={genericContainerStyle}>
      <Typography variant="h1">User Profile</Typography>
      <div className={genericListItemStyle}>
        <StyledLink to="/user/changePassword">Change password</StyledLink>
      </div>
      <div className={genericListItemStyle}>
        <StyledLink to="/user/quizzes">Quizzes</StyledLink>
      </div>
      <div className={genericListItemStyle}>
        <StyledLink to="/user/solvedQuizzes">Solved quizzes</StyledLink>
      </div>
    </div>
  )
}

export default ProfileNavigation