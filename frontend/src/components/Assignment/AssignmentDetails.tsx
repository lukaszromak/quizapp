import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Fragment } from "react"

import { Assignment } from "types"
import { axiosPrivate } from "misc/utils"
import { useAppSelector, useAppDispatch } from "store"
import { genericContainerStyle } from "components/Misc/Styles"
import ErrorMessage from "components/Misc/ErrorMessage"
import { Typography } from "components/Misc/Typography"
import formatDate from "components/Misc/formatDate"
import NavigationButton from "components/Misc/NavigationButton"
import { fetchQuiz } from "features/readQuizSlice"
import { fetchQuizCategory } from "features/quizCategorySlice"
import QuestionsDisplay from "components/Quiz/AnswersDisplay"
import Button from "components/Misc/Button"
import AnswersDisplay from "components/Quiz/AnswersDisplay"

function AssignmentDetails() {
  const authUser = useAppSelector(state => state.auth.user)
  const quiz = useAppSelector(state => state.readQuiz.quiz)
  const dispatch = useAppDispatch()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [solveSubmittedAnswersToDisplay, setSolveSubmittedAnswersToDisplay] = useState<Array<Number>>([])
  const params = useParams()
  const [fetchError, setFetchError] = useState("")
  const navigate = useNavigate()

  const fetchAssignment = async () => {
    if (!params.id) {
      return
    }

    try {
      const response = await axiosPrivate.get(`/assignment/${params.id}`)
      const assignment = response.data
      assignment.startDate = new Date(assignment.startDate)
      assignment.expirationDate = new Date(assignment.expirationDate)
      if (assignment?.solves?.length > 0) {
        for (let i = 0; i < assignment.solves.length; i++) {
          assignment.solves[i].submittedAt = new Date(assignment.solves[i].submittedAt)
        }
      }
      setAssignment(response.data)
      dispatch(fetchQuiz(assignment.quizId))
      dispatch(fetchQuizCategory())
    } catch (exception) {
      setFetchError("Assignment not found.")
    }
  }

  useEffect(() => {
    if (!authUser || !authUser.roles) {
      navigate("/")
    }

    fetchAssignment()
  }, [])

  const toggleSubmittedAnswersView = (solveId: number) => {
    const solve = assignment?.solves.find(solve => solve.id === solveId)

    if (!solve) return

    const id = solveSubmittedAnswersToDisplay.find(id => id === solveId)

    if (id) {
      setSolveSubmittedAnswersToDisplay(solveSubmittedAnswersToDisplay.filter(id => id !== solveId))
    } else {
      setSolveSubmittedAnswersToDisplay([...solveSubmittedAnswersToDisplay, solveId])
    }
  }

  return (
    <div className={genericContainerStyle}>
      {fetchError.length > 0 ? <ErrorMessage>{fetchError}</ErrorMessage>
        :
        (authUser && assignment) &&
        <>
          <Typography variant="h1">Assignment - {assignment.name} {assignment.name && "on"} {formatDate(assignment.startDate, true)}</Typography>
          <Typography variant="p">{assignment.isSynchronous ? "Synchronous assignment" : "Asynchronous assignment"}</Typography>
          {assignment.isSynchronous ?
            <NavigationButton
              navigateTo={(authUser.roles.includes("ROLE_MODERATOR") || authUser.roles.includes("ROLE_ADMIN")) ? `/quiz/hostpanel/${assignment.quizId}` : "/game/:id"}
              state={{ assignmentId: assignment.id, assignmentName: `Assignment - ${assignment.name} ${assignment.name && "on"} ${formatDate(assignment.startDate, true)}` }}>
              {(authUser.roles.includes("ROLE_MODERATOR") || authUser.roles.includes("ROLE_ADMIN")) ? "Host game" : "Play game"}
            </NavigationButton>
            :
            (!authUser.roles.includes("ROLE_MODERATOR") && !authUser.roles.includes("ROLE_ADMIN")) &&
            <NavigationButton
              navigateTo={`/quiz/solve/${assignment.quizId}?assignmentId=${assignment.id}`}>
              Solve assignment
            </NavigationButton>
          }
          <hr className="my-2"></hr>
          {
            <>
              {assignment.solves.length > 0 ?
                <>
                  <table className="w-full table-auto border border-gray-400 mb-5">
                    <caption>Assignment results</caption>
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Username</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Quiz</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Points Scored</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Points Maximum</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Score (%)</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">was Live game</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Submitted at</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignment.solves.map(solve => (
                        <Fragment key={solve.id}>
                          <tr key={solve.id}>
                            <td className="border border-gray-300 p-2">{solve.user.username}</td>
                            <td className="border border-gray-300 p-2">{solve.quiz.title}</td>
                            <td className="border border-gray-300 p-2">{solve.correctAnswers}</td>
                            <td className="border border-gray-300 p-2">{solve.totalAnswers}</td>
                            <td className="border border-gray-300 p-2">{((solve.correctAnswers / solve.totalAnswers) * 100).toFixed(2)}</td>
                            <td className="border border-gray-300 p-2">{solve.wasGame ? "Yes" : "No"}</td>
                            <td className="border border-gray-300 p-2">{formatDate(solve.submittedAt, true)}</td>
                            <td className="border border-gray-300 p-2"><Button color="blue" onClick={() => toggleSubmittedAnswersView(solve.id)}>View</Button></td>
                          </tr>
                          {solveSubmittedAnswersToDisplay.includes(solve.id) && 
                          <tr key={`${solve.id}-submittedAnswers`} className="border border-gray-300 p-2">
                            <td colSpan={8}>
                              <AnswersDisplay quizQuestions={quiz.questions} submittedAnswers={solve.userAnswers}></AnswersDisplay>
                            </td>
                          </tr>
                          }
                        </Fragment>
                      ))
                      }
                    </tbody>
                  </table>
                </>
                :
                <Typography variant="p">No submitted solutions.</Typography>}
              <hr className="my-2"></hr>
              <Typography variant="h1">{quiz.title}</Typography>
              <Typography variant="p" className="mb-4">❓ {quiz.questions.length} questions</Typography>
              <QuestionsDisplay quizQuestions={quiz.questions} />
            </>
          }
        </>
      }
    </div>
  )
}

export default AssignmentDetails