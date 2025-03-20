import ErrorMessage from "components/Misc/ErrorMessage"
import { axiosPrivate } from "misc/utils"
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"

import { Path } from "types"
import AddStudent from "./AddStudent"
import { Typography } from "components/Misc/Typography"
import { genericListItemStyle } from "components/Misc/Styles"
import formatDate from "components/Misc/formatDate"

function PathDetails() {
  const [path, setPath] = useState<Path | null>(null)
  const [error, setError] = useState<string>("")
  const { id } = useParams()

  useEffect(() => {
    fetchPath()
  }, [])

  const fetchPath = async () => {
    try {
      const res = await axiosPrivate.get(`/path/${id}`, { withCredentials: true })
      const path = res.data
      
      for(let i = 0; i < path.assignments.length; i++) {
        path.assignments[i].startDate = new Date(path.assignments[i].startDate)
        path.assignments[i].expirationDate = new Date(path.assignments[i].expirationDate)
      }

      setPath(res.data)
      console.log(res.data)
      setError("")
    } catch(error) {
      setError("Classroom not found.")
    }
  }

  return (
      error !== "" ? <ErrorMessage>{error}</ErrorMessage>
      :
      (path !== null && error === "") &&
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Typography variant="h3">Assignments</Typography>
        {path.assignments.toSorted((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime()).map(assignment => (
          <div className={genericListItemStyle}>
            {/* {assignment.startDate.toDateString()} assignment  */}
            {assignment.name} {assignment.name && "on"} {formatDate(assignment.startDate, true)}
          </div>
        ))}
        <AddStudent path={path} setPath={setPath}></AddStudent>
        <Typography variant="h3">Quizzes</Typography>
        {path.quizzes.map(quiz => (
          <div className={genericListItemStyle}>
            {quiz.title}
            <Link to="/teacher/createAssignment" state={{quizId: quiz.id, quizName: quiz.title, pathId: path.id, pathName: path.name}}>Create assignment</Link>
          </div>
        ))}
      </div>
  )
}

export default PathDetails