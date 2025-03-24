import { Question, SubmittedAnswer } from "types"
import { config } from "misc/constants";

type WithHandleInput = {
  handleInput: (e: React.FormEvent<HTMLInputElement>, qidx: number | null) => void;
  quizQuestions: Array<Question>;
  submittedAnswers?: null;
};

type WithUserAnswers = {
  handleInput?: null;
  quizQuestions: Array<Question>;
  submittedAnswers: Array<SubmittedAnswer>;
};

type WithIsValid = {
  handleInput?: null,
  quizQuestions: Array<Question>,
  submittedAnswers?: null
}

type AnswersParams = WithHandleInput | WithUserAnswers | WithIsValid;

function AnswersDisplay({ handleInput, quizQuestions, submittedAnswers }: AnswersParams) {
  console.log(submittedAnswers)
  return (
    quizQuestions.map((question) => {
      return (
        <div key={question.id} className="mb-2 border-2 border-dashed px-8 py-4 mb-1">
          {question.imagePath && <img src={`${config.url.STORAGE_BASE_URL}${question.imagePath}`} alt={question.question} />}
          <div>{question.question}</div>
          {question.answers.map((answer) => (
            <div key={answer.id}>
              {submittedAnswers //WithUserAnswers case
                ?
                <div className={ answer.isValid ? "bg-green-500" : submittedAnswers.find(submittedAnswer => submittedAnswer.question.id === question.id)?.answer.id === answer.id ? "bg-red-500" : "" }>
                  <input type="radio" checked={ submittedAnswers.find(submittedAnswer => submittedAnswer.question.id === question.id)?.answer.id === answer.id } readOnly></input>
                  <label htmlFor="">{answer.content}</label>
                </div>
                :
                handleInput // WithHandleInput case
                  ?
                  <>
                    <input type="radio" id={answer.id?.toString()} value={answer.id ? answer.id : ""} onChange={(e) => handleInput(e, question.id)} checked={answer.isValid} />
                    <label htmlFor={question.id?.toString()}>{answer.content}</label>
                  </>
                  : /* WithIsValid case */ <>
                    <input type="radio" id={answer.id?.toString()} value={answer.id ? answer.id : ""} checked={answer.isValid} readOnly />
                    <label htmlFor={question.id?.toString()}>{answer.content}</label>
                  </>}
            </div>
          ))}
        </div>
      )
    })
  )
}

export default AnswersDisplay