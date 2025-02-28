import { Quiz, QuizDto } from "types";
import { useState, useEffect, Ref } from "react";
import { useAppDispatch, useAppSelector } from "store";

import { history } from "helpers/history";
import { reset, create, setTitle, readFromLocalStorage, addQuestion, deleteQuestion, addAnswer, deleteAnswer, handleQuestionInput, handleAnswerInput, markAnswerAsCorrect, handleTimeToAnswerInput, handleQuestionImageInput, toggleCategory, clearQuestionImage } from "features";
import { fetchQuizCategory } from "features/quizCategorySlice";
import Button from "components/Misc/Button";
import ErrorMessage from "components/Misc/ErrorMessage";

const categoriesColors = [
  'bg-violet-700',
  'bg-indigo-700',
  'bg-sky-500',
  'bg-green-500',
  'bg-yellow-400',
  'bg-orange-500',
  'bg-red-600'
]

function CreateQuiz() {
  const quizCategoriesState = useAppSelector(state => state.quizCategory)
  const quiz = useAppSelector(state => state.createQuiz.quiz)
  const createdQuizId = useAppSelector(state => state.createQuiz.createdQuizId)
  const error = useAppSelector(state => state.createQuiz.error)
  const [emptyQuestionErrors, setEmptyQuestionErrors] = useState<Array<number>>([])
  const [emptyAnswerErrors, setEmptyAnswerErrors] = useState<Array<string>>()
  const [emptyTitle, setEmptyTitle] = useState(false)
  const [noQuestions, setNoQuestions] = useState(false)
  const [hasValidationErrors, setHasValidationErrors] = useState(false)
  const isLoading = useAppSelector(state => state.createQuiz.isLoading)
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(readFromLocalStorage())
    dispatch(fetchQuizCategory())
  }, [])

  useEffect(() => {
    localStorage.removeItem("quiz")
    localStorage.setItem("quiz", JSON.stringify(quiz))
  }, [quiz])

  useEffect(() => {
    // if (createdQuizId) {
    //   localStorage.removeItem("quiz")
    //   history.navigate?.(`/quiz/details/${createdQuizId}`)
    //   dispatch(reset())
    // }
  }, [quiz])

  const validateQuiz = (quiz: QuizDto) => {
    let emptyTitle = false
    let noQuestions = false
    const emptyQuestionErrors = []
    const emptyAnswerErrors = []

    if (quiz.title === "" || quiz.title === null || quiz.title === undefined) {
      emptyTitle = true
    }

    if (quiz.questions === null || quiz.questions === undefined || quiz.questions.length == 0) {
      noQuestions = true
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      if (!quiz.questions[i].question) {
        emptyQuestionErrors.push(i)
      }

      for (let j = 0; j < quiz.questions[i].answers.length; j++) {
        if (!quiz.questions[i].answers[j].content) {
          emptyAnswerErrors.push(`${i}:${j}`)
        }
      }
    }

    if (emptyQuestionErrors.length > 0 || emptyAnswerErrors.length > 0 || emptyTitle || noQuestions) {
      setHasValidationErrors(true)
      setEmptyQuestionErrors(emptyQuestionErrors)
      setEmptyAnswerErrors(emptyAnswerErrors)
      setEmptyTitle(emptyTitle)
      setNoQuestions(noQuestions)
      return false
    }

    setHasValidationErrors(false)
    return true
  }

  const handleSubmit = () => {
    if (!validateQuiz(quiz)) {
      return
    }
    if (!isLoading) {
      dispatch(create(quiz))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-1">
        <label className="block my-2 font-medium" htmlFor="quizTitle">Quiz title</label>
        <input className="rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md p-1"
          type="text"
          value={quiz.title}
          onInput={(e) => dispatch(setTitle(e.currentTarget.value))}
          id="quizTitle" />
        {emptyTitle ? <ErrorMessage>Quiz title empty.</ErrorMessage> : ""}
      </div>
      {noQuestions ? <ErrorMessage>No questions.</ErrorMessage>
        :
        <div className="font-medium my-2">Quiz questions</div>}
      {quiz.questions.map((item, qidx) => (
        <div id="questions" key={qidx} className="border-2 border-dashed p-8 mb-1">
          <Button onClick={() => dispatch(deleteQuestion(qidx))} color="red" style="block mb-2 float-right">Remove this question</Button>
          <input className="mt-2 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md"
            type="text"
            value={quiz.questions[qidx].question}
            onInput={(e) => dispatch(handleQuestionInput({ content: e.currentTarget.value, idx: qidx }))}
            placeholder={` Question ${qidx + 1}`} />
          {emptyQuestionErrors.includes(qidx) ? <ErrorMessage>Question empty.</ErrorMessage> : ""}
          {item.answers.map((_, idx) => (
            <div className="w-max" key={idx}>
              <div className="flex mt-2">
                <div>
                  <input className="mr-1"
                    type="checkbox"
                    onChange={(e) => dispatch(markAnswerAsCorrect({ checked: e.currentTarget.checked, qidx: qidx, aidx: idx }))}
                    checked={quiz.questions[qidx].answers[idx].isValid} />
                  <input className="w-max rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md"
                    type="text"
                    value={quiz.questions[qidx].answers[idx].content}
                    onInput={(e) => dispatch(handleAnswerInput({ content: e.currentTarget.value, qidx: qidx, aidx: idx }))}
                    placeholder={` Answer ${idx + 1}`} />
                  {(emptyAnswerErrors?.includes(`${qidx}:${idx}`)) ? <ErrorMessage>Answer empty.</ErrorMessage> : ""}
                </div>
                <Button onClick={() => dispatch(deleteAnswer({ qidx: qidx, aidx: idx }))} color="red" style="mb-2 ml-1">X</Button>
              </div>
            </div>
          ))}
          <div className="mt-5 mb-5">
            <Button onClick={() => dispatch(addAnswer(qidx))} color="green" style="block">Add answer</Button>
          </div>
          <div className="mb-2">
            <label className="mb-1 border border-1 p-2 hover:cursor-pointer bg-green-500 hover:bg-green-700 text-white font-semibold text-white py-2 px-4 border border-green-700 hover:border-transparent rounded" htmlFor={`file-${qidx}`}>Add image (optional)</label>
            {quiz.questions[qidx].imageBase64 && <Button onClick={() => dispatch(clearQuestionImage(qidx))} color="red" style="mb-2">Delete image</Button>}
            {quiz.questions[qidx].imageBase64 && <img className="mb-4 rounded" src={quiz.questions[qidx].imageBase64} />}
            <input className="w-max rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md mb-2 hidden"
              id={`file-${qidx}`}
              type="file"
              onInput={(e) => dispatch(handleQuestionImageInput({ idx: qidx, files: e.currentTarget.files }))} />
          </div>
          <div className="mt-5 mb-2">
            <label className="block mb-1" htmlFor={`time-to-answer-${qidx}`}>Time to answer (optional)</label>
            <input className="w-max rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md mb-2"
              id={`time-to-answer-${qidx}`}
              type="number"
              onChange={(e) => dispatch(handleTimeToAnswerInput({ qidx: qidx, time: e.currentTarget.value }))}
              value={quiz.questions[qidx].timeToAnswer}
              placeholder=" 10" />
          </div>
        </div>
      ))}
      <Button onClick={() => dispatch(addQuestion())} color="green" style="mt-2">Add question</Button>
      <div className="font-medium mt-2">Quiz categories</div>
      <div className="max-w-100 flex flex-wrap gap-1 mb-2">
        {quizCategoriesState.quizCategories.map((item, idx) => (
          <button className={quiz.categories.findIndex((x) => x.id == item.id) != -1 ? `border p-2 my-2 rounded font-medium bg-white text-black` : `text-white ${categoriesColors[idx % categoriesColors.length]} border p-2 my-2 rounded font-medium hover:bg-white hover:text-black hover:border`}
            key={item.id}
            onClick={() => dispatch(toggleCategory({ idx: item.id, categories: quizCategoriesState.quizCategories }))}>
            {item.name}
          </button>
        ))}
      </div>
      {hasValidationErrors ? <ErrorMessage>Please fill out required fields.</ErrorMessage> : ""}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button onClick={() => handleSubmit()} color="blue">Submit</Button>
    </div>
  )
}

export default CreateQuiz