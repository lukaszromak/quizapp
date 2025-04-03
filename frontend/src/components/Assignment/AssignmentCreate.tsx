import { Typography } from "components/Misc/Typography"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Assignment } from "types"
import { genericTextInputStyle } from "components/Misc/Styles"
import Button from "components/Misc/Button"
import { axiosPrivate } from "misc/utils"
import ErrorMessage from "components/Misc/ErrorMessage"
import { formatDate } from "misc/utils"
import { genericContainerStyle } from "components/Misc/Styles"

function AssignmentCreate() {
  const location = useLocation()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState<Assignment>({
    id: null,
    name: "",
    quizId: location.state.quizId,
    pathId: location.state.pathId,
    solves: [],
    startDate: new Date(),
    expirationDate: new Date(),
    isSynchronous: true,
    allowAsynchronousSubmission: false,
    allowSubmitAfterExpiration: false
  })
  const [submitError, setSubmitError] = useState("")
  const [dateError, setDateError] = useState("")
  const [alreadyExpiredError, setAlreadyExpiredError] = useState("")

  const validateFields = (): boolean => {
    setDateError("")
    setAlreadyExpiredError("")

    if (new Date().getTime() > assignment.startDate.getTime()) {
      setAlreadyExpiredError("Assignment start date must be in the future.")
      return false
    }

    if (!assignment.isSynchronous && assignment.expirationDate.getTime() < assignment.startDate.getTime()) {
      setDateError("Assignment expires before it starts.")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    setSubmitError("")
    if (!validateFields()) return

    try {
      const response = await axiosPrivate.post("/assignment", assignment)
      navigate(`/path/details/${assignment.pathId}`)
    } catch (ex) {
      setSubmitError("Error while creating assignment.")
    }
  }

  return (
    <>
      <Typography variant="h1" className="text-center">Create Assignment</Typography>
      <div className={genericContainerStyle}>
        <p>Quiz: {location.state.quizName}</p>
        <p>Classroom: {location.state.pathName}</p>
        <label htmlFor="assignmentName" className="block">Name</label>
        <input
          id="assignmentName"
          name="assignmentName"
          type="text"
          value={assignment.name}
          onInput={(e) => setAssignment({ ...assignment, name: e.currentTarget.value })}
          className={genericTextInputStyle} />
        <label htmlFor="isSynchronous" className="block">Live game?</label>
        <input
          name="isSynchronous"
          type="checkbox"
          checked={assignment.isSynchronous}
          onChange={(e) => setAssignment({ ...assignment, isSynchronous: e.currentTarget.checked })} />
        <label htmlFor="startDate" className="block">Start date</label>
        <input
          id="startDate"
          name="startDate"
          type="datetime-local"
          value={formatDate(assignment.startDate, false)}
          onInput={(e) => setAssignment({ ...assignment, startDate: new Date(e.currentTarget.value) })}
          className={genericTextInputStyle} />
        {!assignment.isSynchronous &&
          <>
            <label htmlFor="expirationDate" className="block">Expiration date</label>
            <input
              name="expirationDate"
              type="datetime-local"
              value={formatDate(assignment.expirationDate, false)}
              onInput={(e) => setAssignment({ ...assignment, expirationDate: new Date(e.currentTarget.value) })}
              className={genericTextInputStyle} />
          </>}
        {dateError.length > 0 && <ErrorMessage>{dateError}</ErrorMessage>}
        {alreadyExpiredError.length > 0 && <ErrorMessage>{alreadyExpiredError}</ErrorMessage>}
        {submitError.length > 0 && <ErrorMessage>{submitError}</ErrorMessage>}
        <Button color="blue" style="block" onClick={handleSubmit}>Create</Button>
      </div>
    </>
  )
}

export default AssignmentCreate