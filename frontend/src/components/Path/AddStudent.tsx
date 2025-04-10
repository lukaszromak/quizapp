import { useState } from "react"

import { Typography } from "components/Misc/Typography"
import ErrorMessage from "components/Misc/ErrorMessage"
import Button from "components/Misc/Button"
import { Student } from "types"
import { axiosPrivate } from "helpers/utils"
import { genericTextInputStyle, genericListItemStyle } from "components/Misc/Styles"
import { Path } from "types"

type StudentProps = {
  studentsList: Student[];
  setStudentsList: React.Dispatch<React.SetStateAction<Student[]>>;
};

type PathProps = {
  path: Path;
  setPath: React.Dispatch<React.SetStateAction<Path | null>>;
};

type AddStudentProps = StudentProps | PathProps;

function AddStudent(props: AddStudentProps) {
  const studentList = "studentsList" in props 
  ? props.studentsList 
  : props.path?.students ?? []
  const [studentText, setStudentText] = useState("")
  const [addUserError, setAddUserError] = useState("")

  const addUser = async () => {
    setAddUserError("")
    try {
      const response = await axiosPrivate.get(`/user/exists?searchString=${studentText}`)
      if (response.data.exists === true) {
        if ("setPath" in props) {
          const path = props.path
          path.students = [...path.students, {id: response.data.id, username: response.data.username}]
          const updateResponse = await axiosPrivate.put(`/path`, props.path)
          const updated = updateResponse.data as Path
          for (let i = 0; i < path.assignments.length; i++) {
            updated.assignments[i].startDate = new Date(updated.assignments[i].startDate)
            updated.assignments[i].expirationDate = new Date(updated.assignments[i].expirationDate)
          }
          console.log(updated)
          props.setPath(updated)
        }

        if ("setStudentsList" in props) {
          console.log(response.data)
          props.setStudentsList([...props.studentsList, response.data])
        }
        setStudentText("")
      } else if (response.data.exists === false) {
        setAddUserError("Student not found.")
      }
    } catch (error) {
      setAddUserError("Error while trying to add student.")
    }
  }

  const deleteStudent = async (username: string | undefined) => {
    if(!("studentsList" in props) && props.path?.students) {
      try {
        await axiosPrivate.delete(`/path/${props.path.id}/students/${username}`)
      } catch(error) {
        console.log(error)
        return
      }
      props.setPath({...props.path, students: props.path.students.filter(student => student.username !== username)})
    } else if("setStudentsList" in props) {
      props.setStudentsList(studentList.filter(student => student.username !== username))
    }
  }

  return (
    <>
      <Typography variant="h4">Students</Typography>
      {studentList.length == 0 && <div className={genericListItemStyle}><p>Here will appear added students</p></div>}
      {studentList.map(((student, idx) => (
        <div key={student.id} className={`${genericListItemStyle} flex justify-between`} draggable="true">
          <span>
            {student.username}
          </span>
          <Button color="red" onClick={() => deleteStudent(student.username)}>Delete</Button>
        </div>
      )))}
      <Typography variant="p" className="mb-1">add students by their username, email or id</Typography>
      <input type="text" placeholder="lukaszromak" value={studentText} onInput={(e) => setStudentText(e.currentTarget.value)} className={`${genericTextInputStyle}`}></input>
      {addUserError.length > 0 && <ErrorMessage>{addUserError}</ErrorMessage>}
      <Button color="green" style="block mt-2" onClick={() => addUser()}>Add</Button>
    </>
  )
}

export default AddStudent