import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "store"

import { fetchQuiz } from "features/readQuizSlice"
import { fetchQuizCategory } from "features/quizCategorySlice";
import RainbowQuizCategories from "components/QuizCategory/RainbowQuizCategories"
import NavigationButton from "components/Misc/NavigationButton"
import { Typography } from "components/Misc/Typography"
import { genericContainerStyle } from "components/Misc/Styles";

function QuizDetails() {
    const user = useAppSelector(state => state.auth.user)
    const [noAuth, setNoAuth] = useState(false)
    const quiz = useAppSelector(state => state.readQuiz.quiz)
    const dispatch = useAppDispatch()
    const { id } = useParams()

    useEffect(() => {
        if(user == null) {
            setNoAuth(true)
        } else {
            setNoAuth(false)
        }
        if(id) {
            const parsedId = parseInt(id)
            if(!isNaN(parsedId)) {
                dispatch(fetchQuiz(parsedId))
            }
        }
    }, [user])

    return (
        <div className={genericContainerStyle}>
            {/* <Button onClick={() => console.log()}></Button> */}
            <Typography variant="h1">{quiz.title}</Typography>
            <Typography variant="p" className="mb-4">❓ {quiz.questions.length} questions</Typography>
            <RainbowQuizCategories categories={quiz.categories} className="mb-4"/>
            {noAuth 
                ? 
            <NavigationButton navigateTo={`/login/?returnUrl=/quiz/details/${quiz.id}`}>Login to solve quiz</NavigationButton> 
                : 
            <>
            <NavigationButton navigateTo={`/quiz/solve/${quiz.id}`}>Start quiz</NavigationButton>
            <NavigationButton navigateTo={`/quiz/hostpanel/${quiz.id}`}>Host quiz</NavigationButton>
            </>}
        </div>
    )
}

export default QuizDetails