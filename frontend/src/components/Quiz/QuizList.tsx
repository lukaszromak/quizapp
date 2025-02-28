import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "store"

import { axiosPublic, axiosPrivate } from "misc/utils"
import { Quiz } from "types"
import { fetchQuizCategory } from "features/quizCategorySlice";
import RainbowQuizCategories from "components/QuizCategory/RainbowQuizCategories"
import { Typography } from "components/Misc/Typography"
import NavigationButton from "components/Misc/NavigationButton"

function QuizList({ source }: { source?: string }) {
  const user = useAppSelector(state => state.auth.user)
  const [quizes, setQuizes] = useState<Array<Quiz>>([])
  const dispatch = useAppDispatch();

  useEffect(() => {
      dispatch(fetchQuizCategory())
  }, [])

  const fetchQuizes = async () => {
    let url = '/quiz'
    let axiosInstance = axiosPublic
    const args: any = {}

    if(source) {
      url = source
      axiosInstance = axiosPrivate
      args.withCredentials = true
    }

    const response = await axiosInstance.get(url, args)

    if (response.status === 200) {
      setQuizes(response.data)
    }
  }

  useEffect(() => {
    if(source && !user) {
      return
    }
    fetchQuizCategory()
    fetchQuizes()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {(source && !user) 
        ? 
      <NavigationButton navigateTo="/login?returnUrl=/user/quizzes">Login to view your quizzes</NavigationButton> 
        :
      <>
        <Typography variant="h1" className="mb-2">Quizzes</Typography>
        {quizes.length === 0 && <Typography variant="p">You haven't created any quizzes.</Typography>}
        {quizes.map((quiz) => (
          <div key={quiz.id} className="mb-2 border-2 border-dashed px-8 py-4 mb-1">
            <Link to={`/quiz/details/${quiz.id}`}>
              <Typography variant="h5">{quiz.title}</Typography>
            </Link>
            <RainbowQuizCategories categories={quiz.categories}/>
          </div>
        ))}
      </>
      }
    </div>
  )
}

export default QuizList