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
import { genericListItemStyle, genericTextInputStyle } from "components/Misc/Styles"
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
    const response = await axiosPrivate.get('/user/quizzes', { withCredentials: true })

    if (response.status === 200) {
      setOwnQuizes(response.data)
    }
  }

  const searchQuizes = async () => {
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

  const moveQuiz = (idx: number | null, moveUp: boolean) => {
    if (!idx && idx !== 0) return

    const _selectedQuizes = [...selectedQuizes]
    let tmp
    console.log(idx)
    if (moveUp) {
      if (idx - 1 >= 0 && idx < _selectedQuizes.length) {
        tmp = _selectedQuizes[idx - 1]
        _selectedQuizes[idx - 1] = _selectedQuizes[idx]
        _selectedQuizes[idx] = tmp
      }
    } else {
      if (idx + 1 < _selectedQuizes.length && idx >= 0) {
        tmp = _selectedQuizes[idx + 1]
        _selectedQuizes[idx + 1] = _selectedQuizes[idx]
        _selectedQuizes[idx] = tmp
      }
    }
    console.log(_selectedQuizes)
    setSelectedQuizes(_selectedQuizes)
  }

  const handleSubmit = async () => {
    const path: Path = {
      id: null,
      name: name,
      students: studentsList.map((student) => ({ id: student.id})),
      quizzes: selectedQuizes,
      teachers: [],
      assignments: []
    }
    setSubmitError("")

    try {
      const response = await axiosPrivate.post("/path", path, { withCredentials: true })
      navigate(`/path/details/${response.data.id}`)
    } catch (error) {
      setSubmitError("Error while submitting a path.")
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Typography variant="h1" className="text-center">Create class</Typography>
      <Typography variant="p">Class name</Typography>
      <input type="text" placeholder="Programming class" value={name} onInput={(e) => setName(e.currentTarget.value)} className={genericTextInputStyle} />
      {ownQuizes.length > 0 && <Typography variant="h3">Select quizzes to include in class</Typography>}
      {ownQuizes.map((quiz => (
        selectedQuizes.findIndex(q => q.id == quiz.id) === -1 &&
        <div key={`own${quiz.id}`} className={genericListItemStyle} draggable="true">
          <button onClick={() => navigate(`/quiz/details/${quiz.id}`)} className="mr-1">{quiz.title}</button>
          <input type="checkbox" onChange={(e) => handleSelect(quiz.id, e.currentTarget.checked)} checked={selectedQuizes.findIndex(q => q.id == quiz.id) !== -1} className="p-2" />
        </div>
      )))}
      <Typography variant="h3">{ownQuizes.length > 0 ? "Search for other quizzes" : "Search and select quizzes to include in class"}</Typography>
      <input type="text" placeholder="React basics" value={searchByTitle} onInput={(e) => setSearchByTitle(e.currentTarget.value)} className={genericTextInputStyle} />
      <Button color="blue" style="block" onClick={() => searchQuizes()}>Search</Button>
      {quizes.map((quiz => (
        selectedQuizes.findIndex(q => q.id == quiz.id) === -1 &&
        <div key={quiz.id} className={genericListItemStyle} draggable="true">
          <button onClick={() => navigate(`/quiz/details/${quiz.id}`)} className="mr-1">{quiz.title}</button>
          <input type="checkbox" onChange={(e) => handleSelect(quiz.id, e.currentTarget.checked)} checked={selectedQuizes.findIndex(q => q.id == quiz.id) !== -1} className="p-2" />
        </div>
      )))}
      <Typography variant="h3">Selected quizzes</Typography>
      {selectedQuizes.length === 0 ? <div className={genericListItemStyle}><Typography variant="p">Here will appear quizes you want to include in your class</Typography></div> :
        selectedQuizes.map(((quiz, idx) => (
          <div key={quiz.id} className={genericListItemStyle} draggable="true">
            <span className="mr-3">
              <ChevronUpIcon className="h-6 w-6 hover:cursor-pointer" onClick={() => moveQuiz(idx, true)} />
              <ChevronDownIcon className="h-6 w-6 hover:cursor-pointer" onClick={() => moveQuiz(idx, false)} />
            </span>
            <span className="flex content-center">
              <button onClick={() => navigate(`/quiz/details/${quiz.id}`)} className="mr-1">{quiz.title}</button>
              <input type="checkbox" onChange={(e) => handleSelect(quiz.id, e.currentTarget.checked)} checked={selectedQuizes.findIndex(q => q.id == quiz.id) !== -1} className="p-2" />
            </span>
          </div>
        )))}
      <AddStudent studentsList={studentsList} setStudentsList={setStudentsList}></AddStudent>
      {submitError !== "" && <ErrorMessage>{submitError}</ErrorMessage>}
      <Button color="blue" style="block" onClick={() => handleSubmit()}>Submit</Button>
    </div>
  )
}

export default PathCreate;