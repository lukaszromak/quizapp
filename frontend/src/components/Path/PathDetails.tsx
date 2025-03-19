import ErrorMessage from "components/Misc/ErrorMessage"
import { Typography } from "components/Misc/Typography"
import { axiosPrivate } from "misc/utils"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import { Path } from "types"
import { genericListItemStyle } from "components/Misc/Styles"
import AddStudent from "./AddStudent"

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
        <Typography variant="h3">Students in class</Typography>
        {path.students.map((student) => (
          <div className={genericListItemStyle}>{student.username}</div>
        ))}
        <AddStudent path={path} setPath={setPath}></AddStudent>
      </div>
  )
}

export default PathDetails