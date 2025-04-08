import ErrorMessage from "components/Misc/ErrorMessage"
import { axiosPrivate } from "helpers/utils"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { Path } from "types"
import AddStudent from "./AddStudent"
import { Typography } from "components/Misc/Typography"
import { genericListItemStyle, genericContainerStyle, genericTextInputStyle } from "components/Misc/Styles"
import { formatDate } from "helpers/utils"
import { useAppSelector } from "store"
import StyledLink from "components/Misc/StyledLink"
import Button from "components/Misc/Button"
import { Quiz } from "types"

function PathDetails() {
  const authUser = useAppSelector(state => state.auth.user)
  const navigate = useNavigate()
  const [path, setPath] = useState<Path | null>(null)
  const [error, setError] = useState<string>("")
  const { id } = useParams()
  const [ownQuizes, setOwnQuizes] = useState<Array<Quiz>>([])
  const [noQuizzesFound, setNoQuizzesFound] = useState("")
  const [searchByTitle, setSearchByTitle] = useState("")
  const [foundQuizzes, setFoundQuizzes] = useState<Array<Quiz>>([])

  useEffect(() => {
    if (!authUser) navigate("/")

    fetchPath()
    fetchQuizes()
  }, [authUser])

  const fetchQuizes = async () => {
    const response = await axiosPrivate.get('/user/quizzes')

    if (response.status === 200) {
      setOwnQuizes(response.data)
    }
  }

  const fetchPath = async () => {
    try {
      const res = await axiosPrivate.get(`/path/${id}`)
      const path = res.data

      for (let i = 0; i < path.assignments.length; i++) {
        path.assignments[i].startDate = new Date(path.assignments[i].startDate)
        path.assignments[i].expirationDate = new Date(path.assignments[i].expirationDate)
      }

      setPath(res.data)
      console.log(res.data)
      setError("")
    } catch (error) {
      setError("Path not found.")
    }
  }

  const deleteAssignment = async (id: number | null) => {
    if (!path) return

    try {
      await axiosPrivate.delete(`/path/${path.id}/assignments/${id}`)
      setPath({ ...path, assignments: path.assignments.filter(assignment => assignment.id !== id) })
    } catch (error) {
      console.log(error)
    }
  }

  const deleteQuiz = async (id: number | null) => {
    if (!path) return

    try {
      await axiosPrivate.delete(`/path/${path.id}/quizzes/${id}`)
      setPath({ ...path, quizzes: path.quizzes.filter(quiz => quiz.id !== id) })
    } catch (error) {
      console.log(error)
    }
  }

  const addQuiz = async (quiz: Quiz | null) => {
    if (!path || !quiz?.id) return

    try {
      await axiosPrivate.put(`/path/${path.id}/quizzes/${quiz.id}`)
      setPath({ ...path, quizzes: [...path.quizzes, quiz] })
    } catch (error) {
      console.log(error)
    }
  }

  const searchQuizes = async () => {
    setNoQuizzesFound("")
    let url = '/quiz'

    if (searchByTitle && searchByTitle !== "") {
      url += `?title=${searchByTitle}`
    } else {
      return
    }

    const response = await axiosPrivate.get(url)

    if (response.status === 200 && path?.quizzes) {
      const _quizes = [...path?.quizzes]
      const searchedQuizes = response.data

      for (let i = 0; i < searchedQuizes.length; i++) {
        if (_quizes.findIndex(quiz => quiz.id == searchedQuizes[i].id) === -1) {
          _quizes.push(searchedQuizes[i])
        }
      }

      if (searchedQuizes.length === 0) {
        setNoQuizzesFound("No quizzes found.")
      }
      setFoundQuizzes(_quizes)
    }
  }

  return (
    <div className={genericContainerStyle}>
      {error !== "" ? <ErrorMessage>{error}</ErrorMessage>
        :
        (path !== null && error === "") &&
        <>
          <Typography variant="h3">Assignments</Typography>
          {path.assignments.length == 0 && <ErrorMessage>No assignments found.</ErrorMessage>}
          {path.assignments.toSorted((a, b) => b.expirationDate.getTime() - a.expirationDate.getTime()).map(assignment => (
            <div key={assignment.id} className={`${genericListItemStyle} flex items-center justify-between gap-2`}>
              <span className="flex items-center">
                <StyledLink to={`/assignment/details/${assignment.id}`}>
                  {`${assignment.name ? `${assignment.name} on` : ""} ${formatDate(assignment.startDate, true)}`}
                </StyledLink>
                <p className="p-2 border rounded font-medium">{assignment.isSynchronous ? "Synchronous" : "Asynchronous"}</p>
              </span>
              <Button color="red" onClick={() => deleteAssignment(assignment.id)}>Delete</Button>
            </div>
          ))}
          {
            authUser?.roles && (authUser.roles.includes("ROLE_MODERATOR") || authUser.roles.includes("ROLE_ADMIN")) &&
            <>
              <AddStudent path={path} setPath={setPath}></AddStudent>
              <Typography variant="h3">Quizzes</Typography>
              {path.quizzes.map(quiz => (
                <div key={quiz.id} className="mb-2 border-2 border-dashed px-8 py-4">
                  <span className="flex justify-between">
                    <span>
                      {quiz.title}
                    </span>
                    <span>
                      <StyledLink to="/teacher/createAssignment" state={{ quizId: quiz.id, quizName: quiz.title, pathId: path.id, pathName: path.name }}>Create assignment</StyledLink>
                      <Button color="red" onClick={() => deleteQuiz(quiz.id)} style="ml-2">Delete</Button>
                    </span>
                  </span>
                </div>
              ))}
              <Typography variant="h4">Add Quizzes</Typography>
              {ownQuizes.map((quiz => (
                path.quizzes.findIndex(q => q.id == quiz.id) === -1 &&
                <div key={`own${quiz.id}`} className={genericListItemStyle} draggable="true">
                  <button onClick={() => navigate(`/quiz/details/${quiz.id}`)} className="mr-1">{quiz.title}</button>
                  <Button color="green" onClick={() => addQuiz(quiz)}>Add</Button>
                </div>
              )))}
              {foundQuizzes.map((quiz => (
                path.quizzes.findIndex(q => q.id == quiz.id) === -1 &&
                <div key={quiz.id} className={genericListItemStyle}>
                  <button onClick={() => navigate(`/quiz/details/${quiz.id}`)} className="mr-1">{quiz.title}</button>
                  <Button color="green" onClick={() => addQuiz(quiz)}>Add</Button>
                </div>
              )))}
              <Typography variant="p" className="mb-1">{ownQuizes.length > 0 ? "Search for other quizzes" : "Search and select quizzes to add"}</Typography>
              <input type="text" placeholder="React basics" value={searchByTitle} onInput={(e) => setSearchByTitle(e.currentTarget.value)} className={`${genericTextInputStyle}`} />
              <ErrorMessage>{noQuizzesFound}</ErrorMessage>
              <Button color="green" style="block mt-2" onClick={() => searchQuizes()}>Search</Button>
            </>
          }</>}
    </div>
  )
}

export default PathDetails