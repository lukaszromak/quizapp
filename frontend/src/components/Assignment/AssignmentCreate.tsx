import { genericTextInputStyle } from "components/Misc/Styles"
import { Typography } from "components/Misc/Typography"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { Assignment } from "types"

function AssignmentCreate() {
  const location = useLocation()
  const [assignment, setAssignment] = useState<Assignment>({ 
    id: null,
    quizId: location.state.quizId, 
    pathId: location.state.pathId, 
    startDate: new Date(), 
    expirationDate: new Date(), 
    isSynchronous: false 
  })

  useEffect(() => {
    console.log(assignment.startDate.toJSON())
  }, [])

  return (
    <>
      <Typography variant="h1" className="text-center">Create Assignment</Typography>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <label htmlFor="startDate" className="block">Start date</label>
        <input
          id="startDate" 
          name="startDate" 
          type="datetime-local" 
          value={`${assignment.startDate.toISOString().split("T")[0]}T${assignment.startDate.toISOString().split("T")[1].split(":")[0]}:${assignment.startDate.toISOString().split("T")[1].split(":")[1]}`} 
          onInput={(e) => setAssignment({...assignment, startDate: new Date(e.currentTarget.value)})} 
          className={genericTextInputStyle}/>
        <label htmlFor="expirationDate" className="block">Expiration date</label>
        <input 
          name="expirationDate" 
          type="datetime-local" 
          value={`${assignment.expirationDate.toISOString().split("T")[0]}T${assignment.expirationDate.toISOString().split("T")[1].split(":")[0]}:${assignment.expirationDate.toISOString().split("T")[1].split(":")[1]}`} 
          onInput={(e) => setAssignment({...assignment, expirationDate: new Date(e.currentTarget.value)})} 
          className={genericTextInputStyle}/>
      </div>
    </>
  )
}

export default AssignmentCreate