import { Question } from "types"
import { config } from "misc/constants";

type WithHandleInput = {
  handleInput: (e: React.FormEvent<HTMLInputElement>, qidx: number | null) => void;
  quizQuestions: Array<Question>;
  userQuestions?: null;
};

type WithUserAnswers = {
  handleInput?: null;
  quizQuestions: Array<Question>;
  userQuestions: Array<Question>;
};

type WithIsValid = {
  handleInput?: null,
  quizQuestions: Array<Question>,
  userQuestions?: null
}

type AnswersParams = WithHandleInput | WithUserAnswers | WithIsValid;

interface AnswersColors {
  red?: number
  green?: number
}

const getAnswersColors = (quizQuestions: Question, userQuestions: Question): AnswersColors => {
  if(!quizQuestions || !userQuestions) return {}

  const validQuiz = quizQuestions.answers.find((item) => item.isValid)
  const validUser = userQuestions.answers.find((item) => item.isValid)

  if(!validQuiz || !validUser || !validQuiz.id || !validUser.id) return {}

  if(validQuiz.id == validUser.id) return { green: validQuiz.id }

  return { green: validQuiz.id, red: validUser.id }
}

const getAnswerById = (question: Question, answerId: number|null) => {
  return question?.answers?.find((item) => item.id === answerId)
}

function QuestionsDisplay({ handleInput, quizQuestions, userQuestions }: AnswersParams) {
  return (
    quizQuestions.map((question, qidx) => {
      let answerColors: AnswersColors = {}

      if(userQuestions) {
        answerColors = getAnswersColors(question, userQuestions[qidx])
      }
      return (
      <div key={question.id} className="mb-2 border-2 border-dashed px-8 py-4 mb-1">
        {question.imagePath && <img src={`${config.url.STORAGE_BASE_URL}${question.imagePath}`} alt={question.question}/>}
        <div>{question.question}</div>
        {question.answers.map((answer, aidx) => (
          <div key={answer.id}>
            {userQuestions //WithUserAnswers case
              ?
                (userQuestions[qidx] && userQuestions[qidx].answers[aidx] &&
                  question.answers[aidx]) 
                  ? 
                    <div className={(answerColors.green && answer.id == answerColors.green) ? "bg-green-500" : (answerColors.red && answer.id == answerColors.red) ? "bg-red-500" : ""}>
                      <input type="radio" checked={getAnswerById(userQuestions[qidx], answer.id)?.isValid} readOnly></input>
                      <label htmlFor="">{answer.content}</label>
                    </div>
                  :
                    <>
                      <input type="radio"></input>
                      <label htmlFor="">{answer.content}</label>
                    </>
              :
              handleInput // WithHandleInput case
              ?
                <>
                  <input type="radio" id={answer.id?.toString()} value={answer.id ? answer.id : ""} onChange={(e) => handleInput(e, question.id)} checked={answer.isValid} />
                  <label htmlFor={question.id?.toString()}>{answer.content}</label>
                </>
              : /* WithIsValid case */<>
                  <input type="radio" id={answer.id?.toString()} value={answer.id ? answer.id : ""} checked={answer.isValid} readOnly/>
                  <label htmlFor={question.id?.toString()}>{answer.content}</label>
                </>}
          </div>
        ))}
      </div>
    )})
  )
}

export default QuestionsDisplay