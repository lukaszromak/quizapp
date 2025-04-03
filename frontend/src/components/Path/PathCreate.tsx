import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

import { useAppDispatch, useAppSelector } from "store"
import { axiosPrivate } from "misc/utils"
import { Path, Quiz, Student } from "types"
import { fetchQuizCategory } from "features/quizCategorySlice";
import { Typography } from "components/Misc/Typography"
import Button from "components/Misc/Button"
import ErrorMessage from "components/Misc/ErrorMessage"
import { genericListItemStyle, genericTextInputStyle, genericContainerStyle } from "components/Misc/Styles"
import AddStudent from "./AddStudent"

function PathCreate() {
  const auth = useAppSelector(state => state.auth)
  const [ownQuizes, setOwnQuizes] = useState<Array<Quiz>>([])
  const [quizes, setQuizes] = useState<Array<Quiz>>([])
  const [name, setName] = useState<string>("")
  const [selectedQuizes, setSelectedQuizes] = useState<Array<Quiz>>([])
  const [searchByTitle, setSearchByTitle] = useState("")
  const [studentsList, setStudentsList] = useState<Student[]>([])
  const [submitError, setSubmitError] = useState("")
  const [noQuizzesFound, setNoQuizzesFound] = useState("")
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.user || (!auth.user.roles.includes("ROLE_MODERATOR") && !auth.user.roles.includes("ROLE_ADMIN"))) {
      navigate("/login")
    }
  }, [auth])

  useEffect(() => {
    dispatch(fetchQuizCategory())
    fetchQuizCategory()
    fetchQuizes()
  }, [])

  const fetchQuizes = async () => {
    const response = await axiosPrivate.get('/user/quizzes')

    if (response.status === 200) {
      setOwnQuizes(response.data)
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

    if (response.status === 200) {
      const _quizes = [...quizes]
      const searchedQuizes = response.data

      for (let i = 0; i < searchedQuizes.length; i++) {
        if (_quizes.findIndex(quiz => quiz.id == searchedQuizes[i].id) === -1) {
          _quizes.push(searchedQuizes[i])
        }
      }

      if (searchedQuizes.length === 0) {
        setNoQuizzesFound("No quizzes found.")
      }

      setQuizes(_quizes)
    }
  }

  const handleSelect = (quizId: number | null, checked: boolean) => {
    if (!quizId) return

    const quizesIdx = quizes.findIndex(quiz => quiz.id === quizId)
    const ownQuizesIdx = ownQuizes.findIndex(quiz => quiz.id === quizId)

    if (quizesIdx === -1 && ownQuizesIdx === -1) return

    if (checked) {
      const quizToAdd = quizesIdx !== -1 ? quizes[quizesIdx] : ownQuizes[ownQuizesIdx]
      setSelectedQuizes([...selectedQuizes, quizToAdd])
    } else {
      setSelectedQuizes(selectedQuizes.filter(quiz => quiz.id !== quizId))
    }
  }

  const handleSubmit = async () => {
    const path: Path = {
      id: null,
      name: name,
      students: studentsList.map((student) => ({ id: student.id })),
      quizzes: selectedQuizes,
      teachers: [],
      assignments: []
    }
    setSubmitError("")

    try {
      const response = await axiosPrivate.post("/path", path)
      navigate(`/path/details/${response.data.id}`)
    } catch (error) {
      setSubmitError("Error while submitting a path.")
    }
  }

  return (
    <div className={genericContainerStyle}>
      <Typography variant="h1" className="mb-5">Create Path</Typography>
      <div className="border border-gray-400 rounded-md shadow-md p-4 mb-3">
        <Typography variant="h4">Selected Quizzes</Typography>
        {selectedQuizes.length === 0 ? <div className={genericListItemStyle}><p>Here will appear selected quizzes</p></div> :
          selectedQuizes.map(((quiz, idx) => (
            <div key={quiz.id} className={genericListItemStyle} draggable="true">
              <span className="flex content-center">
                <button onClick={() => navigate(`/quiz/details/${quiz.id}`)} className="mr-1">{quiz.title}</button>
                <input type="checkbox" onChange={(e) => handleSelect(quiz.id, e.currentTarget.checked)} checked={selectedQuizes.findIndex(q => q.id == quiz.id) !== -1} className="p-2" />
              </span>
            </div>
          )))}
        {ownQuizes.length > 0 && <Typography variant="h4">Your quizzes</Typography>}
        {ownQuizes.map((quiz => (
          selectedQuizes.findIndex(q => q.id == quiz.id) === -1 &&
          <div key={`own${quiz.id}`} className={genericListItemStyle} draggable="true">
            <button onClick={() => navigate(`/quiz/details/${quiz.id}`)} className="mr-1">{quiz.title}</button>
            <input type="checkbox" onChange={(e) => handleSelect(quiz.id, e.currentTarget.checked)} checked={selectedQuizes.findIndex(q => q.id == quiz.id) !== -1} className="p-2" />
          </div>
        )))}
        {quizes.length > 0 && <><Typography variant="h4" className="mt-3">Found Quizzes</Typography></>}
        {quizes.map((quiz => (
          selectedQuizes.findIndex(q => q.id == quiz.id) === -1 &&
          <div key={quiz.id} className={genericListItemStyle}>
            <button onClick={() => navigate(`/quiz/details/${quiz.id}`)} className="mr-1">{quiz.title}</button>
            <input type="checkbox" onChange={(e) => handleSelect(quiz.id, e.currentTarget.checked)} checked={selectedQuizes.findIndex(q => q.id == quiz.id) !== -1} className="p-2" />
          </div>
        )))}
        <Typography variant="p" className="mb-1">{ownQuizes.length > 0 ? "Search for other quizzes" : "Search and select quizzes to include in class"}</Typography>
        <input type="text" placeholder="React basics" value={searchByTitle} onInput={(e) => setSearchByTitle(e.currentTarget.value)} className={`${genericTextInputStyle}`} />
        <ErrorMessage>{noQuizzesFound}</ErrorMessage>
        <Button color="green" style="block mt-2" onClick={() => searchQuizes()}>Search</Button>
      </div>
      <div className="border border-gray-400 rounded-md shadow-md p-5 mb-3">
        <AddStudent studentsList={studentsList} setStudentsList={setStudentsList}></AddStudent>
      </div>
      <Typography variant="p">Class name</Typography>
      <input type="text" placeholder="Programming class" value={name} onInput={(e) => setName(e.currentTarget.value)} className={`${genericTextInputStyle} mb-3`} />
      {submitError !== "" && <ErrorMessage>{submitError}</ErrorMessage>}
      <Button color="blue" style="block w-full" onClick={() => handleSubmit()}>Create class</Button>
    </div>
  )
}

export default PathCreate;