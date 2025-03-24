import { useState } from "react"

import { Typography } from "components/Misc/Typography"
import ErrorMessage from "components/Misc/ErrorMessage"
import Button from "components/Misc/Button"
import { Student } from "types"
import { axiosPrivate } from "misc/utils"
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
  : props.path?.students ?? [];
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
          const updated = await axiosPrivate.put(`/path`, props.path)
          console.log(updated)
          props.setPath(updated.data)
        }

        if ("setStudentsList" in props) {
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

  return (
    <>
      <Typography variant="h3">Students</Typography>
      {studentList.length == 0 && <div className={genericListItemStyle}><Typography variant="p">Here will appear added students</Typography></div>}
      {studentList.map(((student, idx) => (
        <div key={student.id} className={genericListItemStyle} draggable="true">
          {student.username}
        </div>
      )))}
      <Typography variant="p" className="mb-2">add students by their username, email or id</Typography>
      <input type="text" placeholder="lukaszromak" value={studentText} onInput={(e) => setStudentText(e.currentTarget.value)} className={`${genericTextInputStyle} mb-2`}></input>
      {addUserError.length > 0 && <ErrorMessage>{addUserError}</ErrorMessage>}
      <Button color="blue" style="block mb-2" onClick={() => addUser()}>Add</Button>
    </>
  )
}

export default AddStudent