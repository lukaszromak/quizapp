import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useAppSelector } from "store";

import { axiosPrivate } from "misc/utils";
import { Question, Quiz, QuizCategory } from "types"
import NavigationButton from "components/Misc/NavigationButton";
import Button from "components/Misc/Button";
import { genericContainerStyle } from "components/Misc/Styles";
import QuestionsDisplay from "./AnswersDisplay";

function QuizSolve() {
  const navigate = useNavigate()
  const user = useAppSelector(state => state.auth.user)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noAuth, setNoAuth] = useState(false)
  const [quiz, setQuiz] = useState<Quiz>({ id: null, title: "", questions: new Array<Question>(), categories: new Array<QuizCategory>() });
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const fetchQuiz = async (id: number) => {
    setIsLoading(true)
    try {
      const response = await axiosPrivate.get(`/quiz/${id}`)
      setQuiz(response.data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendSolution = async () => {
    setIsSubmitting(true)
    try {
      const assignmentId = searchParams.get("assignmentId")
      const response = await axiosPrivate.post(`/quiz/solve/${quiz.id}${assignmentId ? `?assignmentId=${assignmentId}` : ""}`, quiz)
      if (response.status === 200) {
        navigate('/quiz/results',{ state: { results: response.data } });
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (user == null) {
      setNoAuth(true)
      return
    } else {
      setNoAuth(false)
    }
    if (id) {
      const parsedId = parseInt(id)
      fetchQuiz(parsedId)
    }
  }, [user])

  const handleInput = (e: React.FormEvent<HTMLInputElement>, qidx: number | null) => {
    console.log(e)
    if (qidx == null) return

    const parsedId = parseInt(e.currentTarget.value)

    if (isNaN(parsedId)) return

    const questionIdx = quiz.questions.findIndex(question => question.id == qidx)

    if (questionIdx === -1) return

    const answerIdx = quiz.questions[questionIdx].answers.findIndex(answer => answer.id == parsedId)

    if (answerIdx === -1) return

    const newQuiz = { ...quiz }
    newQuiz.questions[questionIdx].answers.forEach(answer => answer.isValid = false)
    newQuiz.questions[questionIdx].answers[answerIdx].isValid = true
    setQuiz(newQuiz)
  }

  const handleSubmit = () => {
    try {
      sendSolution()
    } catch (error) {
      console.log(error)
    }
  }
  
  return (
    <div className={genericContainerStyle}>
      {isLoading && <p>Quiz loading...</p>}
      {noAuth ? <NavigationButton navigateTo={`/login?returnUrl=/quiz/solve/${quiz.id}`}>Login to solve quiz</NavigationButton> :
        <>
          <QuestionsDisplay handleInput={handleInput} quizQuestions={quiz.questions}/>
          <Button onClick={() => handleSubmit()} color="blue" style="" disabled={isSubmitting}>{isSubmitting ? "..." : "Submit"}</Button>
        </>}
    </div>
  )
}

export default QuizSolve