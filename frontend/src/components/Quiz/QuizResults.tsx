import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

import BigTextContainer from "components/Misc/BigTextContainer"
import AnswersDisplay from "./AnswersDisplay"
import { Question } from "types"
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

  const isQuestionsArray = (questions: any): boolean => {
    if (Array.isArray(questions) && questions.every((question) =>
      typeof question.question === "string" &&
      Array.isArray(question.answers) && question.answers.every((answer: any) =>
        typeof answer.content === "string" &&
        typeof answer.isValid === "boolean"
      )
    )
    ) {
      return true
    }

    return false
  }

  const mapUserQuestions = (userAnswers: any[]) => {
    let mapped = []
    for(let i = 0; i < userAnswers.length; i++) {
      let submittedAnswerId = userAnswers[i].answer.id
      for(let j = 0; j < userAnswers[i].question.answers.length; j++) {
        if(userAnswers[i].question.answers[j].id == submittedAnswerId) {
          userAnswers[i].question.answers[j].isValid = true
        } else {
          userAnswers[i].question.answers[j].isValid = false
        }
      }

      mapped.push(userAnswers[i].question)
    }
    console.log(mapped)
    return mapped
  };
  

  const getQuizQuestions = () => {
    const quizQuestions = location?.state?.results?.quiz?.questions

    return isQuestionsArray(quizQuestions) ? quizQuestions : new Array<Question>()
  }

  const getUserQuestions = () => {
    const userQuestions = mapUserQuestions(location?.state?.results?.userAnswers)

    return isQuestionsArray(userQuestions) ? userQuestions : new Array<Question>()
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
        <AnswersDisplay quizQuestions={getQuizQuestions()} userQuestions={getUserQuestions()}/>
      </div>
    </>
  )
}

export default QuizResults