import ErrorMessage from "components/Misc/ErrorMessage"
import { axiosPrivate } from "misc/utils"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { Path } from "types"
import AddStudent from "./AddStudent"
import { Typography } from "components/Misc/Typography"
import { genericListItemStyle, genericContainerStyle } from "components/Misc/Styles"
import { formatDate } from "misc/utils"
import { useAppSelector } from "store"
import StyledLink from "components/Misc/StyledLink"

function PathDetails() {
  const authUser = useAppSelector(state => state.auth.user)
  const navigate = useNavigate()
  const [path, setPath] = useState<Path | null>(null)
  const [error, setError] = useState<string>("")
  const { id } = useParams()

  useEffect(() => {
    if (!authUser) navigate("/")

    fetchPath()
  }, [authUser])

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

  return (
    <div className={genericContainerStyle}>
      {error !== "" ? <ErrorMessage>{error}</ErrorMessage>
        :
        (path !== null && error === "") &&
        <>
          <Typography variant="h3">Assignments</Typography>
          {path.assignments.length == 0 && <ErrorMessage>No assignments found.</ErrorMessage>}
          {path.assignments.toSorted((a, b) => b.expirationDate.getTime() - a.expirationDate.getTime()).map(assignment => (
            <div key={assignment.id} className={`${genericListItemStyle} flex items-center gap-2`}>
              <StyledLink to={`/assignment/details/${assignment.id}`}>
                {`${assignment.name ? `${assignment.name} on` : ""} ${formatDate(assignment.startDate, true)}`}
              </StyledLink>
              <p className="p-2 border rounded font-medium">{assignment.isSynchronous ? "Synchronous" : "Asynchronous"}</p>
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
                    <StyledLink to="/teacher/createAssignment" state={{ quizId: quiz.id, quizName: quiz.title, pathId: path.id, pathName: path.name }}>Create assignment</StyledLink>
                  </span>
                </div>
              ))}
            </>
          }</>}
    </div>
  )
}

export default PathDetails