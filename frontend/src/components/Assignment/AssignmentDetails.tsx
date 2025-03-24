import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

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

function AssignmentDetails() {
  const authUser = useAppSelector(state => state.auth.user)
  const quiz = useAppSelector(state => state.readQuiz.quiz)
  const dispatch = useAppDispatch()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
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
      if(assignment?.solves?.length > 0) {
        for(let i = 0; i < assignment.solves.length; i++) {
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
    if (!authUser || !authUser.roles || (!authUser.roles.includes("ROLE_MODERATOR") && !authUser.roles.includes("ROLE_ADMIN"))) {
      navigate("/")
    }

    fetchAssignment()
  }, [])

  return (
    <div className={genericContainerStyle}>
      {fetchError.length > 0 ? <ErrorMessage>{fetchError}</ErrorMessage>
        :
        (authUser && assignment) &&
        <>
          <Typography variant="h1">Assignment - {assignment.name} {assignment.name && "on"} {formatDate(assignment.startDate, true)}</Typography>
          <hr className="my-2"></hr>
          {authUser.roles.includes("ROLE_MODERATOR") &&
            <>
              {assignment.solves.length > 0 && 
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
                    </tr>
                  </thead>
                  <tbody>
                    {assignment.solves.map(solve => (
                      <tr>
                        <td className="border border-gray-300 p-2">{solve.user.username}</td>
                        <td className="border border-gray-300 p-2">{solve.quiz.title}</td>
                        <td className="border border-gray-300 p-2">{solve.correctAnswers}</td>
                        <td className="border border-gray-300 p-2">{solve.totalAnswers}</td>
                        <td className="border border-gray-300 p-2">{((solve.correctAnswers / solve.totalAnswers) * 100).toFixed(2)}</td>
                        <td className="border border-gray-300 p-2">{solve.wasGame ? "Yes" : "No"}</td>
                        <td className="border border-gray-300 p-2">{formatDate(solve.submittedAt, true)}</td>
                      </tr>
                    ))
                    }
                  </tbody>
                </table>
              </>}
              <hr className="my-2"></hr>
              <Typography variant="h1">{quiz.title}</Typography>
              <Typography variant="p" className="mb-4">❓ {quiz.questions.length} questions</Typography>
              <QuestionsDisplay quizQuestions={quiz.questions}/>
              <NavigationButton
                navigateTo={`/quiz/hostpanel/${assignment.quizId}`}
                state={{ assignmentId: assignment.id, assignmentName: `Assignment - ${assignment.name} ${assignment.name && "on"} ${formatDate(assignment.startDate, true)}` }}>
                Host game
              </NavigationButton>
            </>
          }
        </>
      }
    </div>
  )
}

export default AssignmentDetails