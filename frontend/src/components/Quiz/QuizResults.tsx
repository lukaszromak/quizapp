import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

import BigTextContainer from "components/Misc/BigTextContainer"
import AnswersDisplay from "./AnswersDisplay"
import { Question, SubmittedAnswer } from "types"
import { genericContainerStyle } from "components/Misc/Styles"

function QuizResults() {
  const divRef = useRef<HTMLInputElement>(null)
  const location = useLocation()

  useEffect(() => {
    if (divRef) {
      divRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const getPercentage = () => {
    const correctAnswers = parseFloat(location?.state?.results?.correctAnswers)
    const totalAnswers = parseFloat(location?.state?.results?.totalAnswers)

    if (!isNaN(correctAnswers) && !isNaN(totalAnswers)) {
      return (parseFloat((correctAnswers / totalAnswers).toFixed(4)) * 100).toFixed(2);
    }

    return -1
  }

  const getQuizQuestions = () => {
    const quizQuestions = location?.state?.results?.quiz?.questions

    return quizQuestions ? quizQuestions : new Array<Question>()
  }

  const getUserQuestions = () => {
    const userQuestions = location?.state?.results?.userAnswers

    return userQuestions ? userQuestions : new Array<SubmittedAnswer>()
  }

  return (
    <>
      <BigTextContainer ref_={divRef}>
        <div>Your score: {location?.state?.results?.correctAnswers}/{location?.state?.results?.totalAnswers}</div>
        <div>{getPercentage() != -1 ? `${getPercentage()}%` : ""}</div>
        <div>💀</div>
        <div>Answers</div>
        <div>⬇️⬇️⬇️</div>
      </BigTextContainer>
      <div className={genericContainerStyle}>
        <AnswersDisplay quizQuestions={getQuizQuestions()} submittedAnswers={getUserQuestions()}/>
      </div>
    </>
  )
}

export default QuizResults