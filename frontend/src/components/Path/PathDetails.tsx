import ErrorMessage from "components/Misc/ErrorMessage"
import { axiosPrivate } from "misc/utils"
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"

import { Path } from "types"
import AddStudent from "./AddStudent"
import { Typography } from "components/Misc/Typography"
import { genericListItemStyle } from "components/Misc/Styles"

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
        <AddStudent path={path} setPath={setPath}></AddStudent>
        <Typography variant="h3">Quizzes</Typography>
        {path.quizzes.map(quiz => (
          <div className={genericListItemStyle}>
            {quiz.title}
            <Link to="/teacher/createAssignment" state={{quizId: quiz.id, pathId: path.id}}>Create assignment</Link>
          </div>
        ))}
      </div>
  )
}

export default PathDetails