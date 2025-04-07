import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "store"

import { axiosPublic, axiosPrivate } from "helpers/utils"
import { Quiz } from "types"
import { fetchQuizCategory } from "features/quizCategorySlice";
import RainbowQuizCategories from "components/QuizCategory/RainbowQuizCategories"
import { Typography } from "components/Misc/Typography"
import NavigationButton from "components/Misc/NavigationButton"
import StyledLink from "components/Misc/StyledLink";
import { genericContainerStyle } from "components/Misc/Styles";
import Button from "components/Misc/Button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function QuizList({ source, crud }: { source?: string, crud: boolean }) {
  const user = useAppSelector(state => state.auth.user)
  const [quizes, setQuizes] = useState<Array<Quiz>>([])
  const navigate = useNavigate()
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchQuizCategory())
  }, [])

  const fetchQuizes = async () => {
    let url = '/quiz'
    let axiosInstance = axiosPrivate
    const args: any = {}

    if (source) {
      url = source
    }

    const response = await axiosInstance.get(url, args)

    if (response.status === 200) {
      setQuizes(response.data)
    }
  }

  const deleteQuiz = async (id: number | null) => {
    if (!id || !crud) return

    try {
      await axiosPrivate.delete(`/quiz/${id}`)
      setQuizes(quizes.filter(quiz => quiz.id !== id))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (source && !user) {
      return
    }
    fetchQuizCategory()
    fetchQuizes()
  }, [])

  console.log(typeof(quizes))
  return (
    <div className={genericContainerStyle}>
      {(source && !user)
        ?
        <NavigationButton navigateTo="/login?returnUrl=/user/quizzes">Login to view your quizzes</NavigationButton>
        :
        <>
          <Typography variant="h1" className="mb-2">Quizzes</Typography>
          {quizes.length === 0 && <Typography variant="p">You haven't created any quizzes.</Typography>}
          {quizes.map((quiz) => (
            <div key={quiz.id} className="mb-2 border-2 border-dashed px-8 py-4 mb-1">
              <span className="flex justify-between">
                <StyledLink to={`/quiz/details/${quiz.id}`}>
                  <Typography variant="h5">{quiz.title}</Typography>
                </StyledLink>
                {crud &&
                  <span>
                    <Link to="/quiz/updateQuiz"  state={{ quizId: quiz.id }}>
                      <Button color="blue">EDIT</Button>
                    </Link>
                    <Button
                      color="red"
                      style="ml-2"
                      onClick={() => deleteQuiz(quiz.id)}>
                      Delete
                    </Button>
                  </span>
                }
              </span>
              <RainbowQuizCategories categories={quiz.categories} />
            </div>
          ))}
        </>
      }
    </div>
  )
}

export default QuizList