import QuizList from "components/Quiz/QuizList"

function UserQuizzes() {
    return (
        <QuizList source="/user/quizzes" crud={true}></QuizList>
    )
}

export default UserQuizzes