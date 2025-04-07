import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { axiosPrivate } from '../helpers/utils';
import { QuizDto, QuizCategory } from 'types';

interface ToggleCategoryInput {
  idx: number,
  categories: Array<QuizCategory>
}

interface MarkAnswerInput {
  qidx: number
  aidx: number,
  checked: boolean
}

interface AnswerInput {
  qidx: number,
  aidx: number,
  content: string
}

interface DeleteAnswerInput {
  qidx: number,
  aidx: number
}

interface TimeToAnswerInput {
  qidx: number,
  time: string
}

interface QuestionInput {
  idx: number,
  content: string
}

interface QuestionImageInput {
  idx: number,
  files: FileList | null
}

interface QuizState {
  quiz: QuizDto,
  isLoading: boolean,
  error: string | null,
  updated: boolean,
  createdQuizId: number | null
}

const name = 'createQuiz';

export const update = createAsyncThunk(
  `${name}/update`,
  async (quiz: QuizDto) => {
    const response = await axiosPrivate.put(`/quiz`, quiz)
    return response.data
  }
)

export const create = createAsyncThunk(
  `${name}/create`,
  async (quiz: QuizDto) => {
    const formData = new FormData()

    formData.append("quiz", new Blob([JSON.stringify(quiz)], { type: "application/json" }));

    for(let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i]
      console.log(question.image)
      if(question.image) {
        formData.append(`images`, question.image)
      } else {
        formData.append(`images`, new Blob(Array.from("1")))
      }
    }

    const response = await axiosPrivate.post(`/quiz`, formData);
    return response.data
  }
)

export const fetch = createAsyncThunk(
    `${name}/fetch`,
    async (id: number) => {
        const response = await axiosPrivate.get(`/quiz/${id}`)
        return response.data
    }
)

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    if(reader.result && typeof(reader.result) === "string") {
      resolve(reader.result);
    } else {
      reject()
    }
  }
  reader.onerror = reject;
});

export const handleQuestionImageInput = createAsyncThunk(
  `${name}/handleQuestionImageInput`,
  async(action: QuestionImageInput) => {
    if(!action.files || action.files.length !== 1) {
      return
    }
    
    let base64 = null

    try {
      base64 = await toBase64(action.files[0])
    } catch(e) {
      console.log(e)
    } finally {
      return {
        idx: action.idx,
        base64: base64,
        file: action.files[0]
      }
    }
  } 
)

const initQuiz = (): QuizDto => {
  const quiz: QuizDto = JSON.parse(localStorage?.getItem("quiz") as string)
  if (quiz) {
    for(let i = 0; i < quiz.questions.length; i++) {
      quiz.questions[i].image = undefined
      quiz.questions[i].imageBase64 = undefined
    }
    return quiz
  }

  return {
    title: "",
    questions: [],
    categories: [],
  }
}

const initialState: QuizState = {
  quiz: initQuiz(),
  isLoading: false,
  error: null,
  createdQuizId: null,
  updated: false
};

export const quizSlice = createSlice({
  name: name,
  initialState,
  reducers: {
    reset: (state) => {
      state.quiz = initQuiz()
      state.createdQuizId = null
      state.isLoading = false
      state.error = null
    },
    readFromLocalStorage: (state) => {
      const quiz: QuizDto = JSON.parse(localStorage?.getItem("quiz") as string)
      if (quiz) {
        for(let i = 0; i < quiz.questions.length; i++) {
          quiz.questions[i].image = undefined
          quiz.questions[i].imageBase64 = undefined
        }
        state.quiz = quiz
      }
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.quiz.title = action.payload
    },
    addQuestion: (state) => {
      const quiz = state.quiz

      state.quiz = { ...state.quiz, questions: [...quiz.questions, { question: "", answers: [{ id: null, content: "", isValid: false }, { id: null, content: "", isValid: false }, { id: null, content: "", isValid: false }, { id: null, content: "", isValid: false }] }] }
    },
    deleteQuestion: (state, action: PayloadAction<number>) => {
      const quiz = state.quiz

      state.quiz = { ...quiz, questions: quiz.questions.filter((item, _idx) => _idx != action.payload) }
    },
    addAnswer: (state, action: PayloadAction<number>) => {
      const quiz = state.quiz

      state.quiz = {
        ...quiz, questions: [
          ...quiz.questions.slice(0, action.payload),
          { ...quiz.questions[action.payload], answers: [...quiz.questions[action.payload].answers, { id: null, content: "", isValid: false }] },
          ...quiz.questions.slice(action.payload + 1)
        ]
      }
    },
    deleteAnswer: (state, action: PayloadAction<DeleteAnswerInput>) => {
      const quiz = state.quiz
      const qidx = action.payload.qidx
      const aidx = action.payload.aidx

      state.quiz = ({
        ...quiz, questions: [
          ...quiz.questions.slice(0, qidx),
          { ...quiz.questions[qidx], answers: state.quiz.questions[qidx].answers.filter((item, _idx) => _idx != aidx) },
          ...quiz.questions.slice(qidx + 1)
        ]
      })
    },
    handleQuestionInput: (state, action: PayloadAction<QuestionInput>) => {
      const quiz = state.quiz

      state.quiz = {
        ...quiz, questions: [
          ...quiz.questions.slice(0, action.payload.idx),
          { ...quiz.questions[action.payload.idx], question: action.payload.content },
          ...quiz.questions.slice(action.payload.idx + 1)
        ]
      }
    },
    handleAnswerInput: (state, action: PayloadAction<AnswerInput>) => {
      const quiz = state.quiz

      state.quiz = {
        ...quiz, questions: [
          ...quiz.questions.slice(0, action.payload.qidx),
          { ...quiz.questions[action.payload.qidx], answers: [...quiz.questions[action.payload.qidx].answers.slice(0, action.payload.aidx), { ...state.quiz.questions[action.payload.qidx].answers[action.payload.aidx], content: action.payload.content }, ...state.quiz.questions[action.payload.qidx].answers.slice(action.payload.aidx + 1)] },
          ...quiz.questions.slice(action.payload.qidx + 1)
        ]
      }
    },
    markAnswerAsCorrect: (state, action: PayloadAction<MarkAnswerInput>) => {
      const quiz = {...state.quiz}

      for (let i = 0; i < quiz.questions[action.payload.qidx].answers.length; i++) {
        quiz.questions[action.payload.qidx].answers[i].isValid = false
      }

      if (!action.payload.checked) {
        return
      }

      const qidx = action.payload.qidx
      const idx = action.payload.aidx

      quiz.questions[qidx].answers.forEach(answer => answer.isValid = false)
      quiz.questions[qidx].answers[idx].isValid = true

      state.quiz = quiz
    },
    handleTimeToAnswerInput: (state, action: PayloadAction<TimeToAnswerInput>) => {
      const quiz = {...state.quiz}
      const qidx = action.payload.qidx
      const time = parseInt(action.payload.time)

      if(isNaN(time)) {
        quiz.questions[action.payload.qidx].timeToAnswer = 0
      }

      if(!isNaN(time) && quiz.questions[qidx] && time >= 0 && time <= 120) {
        quiz.questions[action.payload.qidx].timeToAnswer = time
      }

      state.quiz = quiz
    },
    toggleCategory: (state, action: PayloadAction<ToggleCategoryInput>) => {
      console.log(action)
      const categories = action.payload.categories
      const id = action.payload.idx

      if (categories.length == 0) {
        return
      }

      const category = categories.find((item) => item.id == id)

      if (category == undefined) {
        return
      }

      const quiz = state.quiz
      const quizCategory = state.quiz.categories.find((item) => item.id == id)

      if (quizCategory == undefined) {
        state.quiz = { ...quiz, categories: [...quiz.categories.concat(category)] }
      } else {
        const idxToDelete = quiz.categories.findIndex((item) => item.id == id)
        state.quiz = {
          ...quiz, categories: [
            ...quiz.categories.slice(0, idxToDelete),
            ...quiz.categories.slice(idxToDelete + 1)
          ]
        }
      }
    },
    clearQuestionImage: (state, action: PayloadAction<number>) => {
      const quiz = {...state.quiz}

      if(quiz.questions[action.payload]) {
        quiz.questions[action.payload].image = undefined
        quiz.questions[action.payload].imageBase64 = undefined
      }

      state.quiz = quiz
    }
  },
  extraReducers: (builder) => {
    builder.addCase(create.pending, (state) => {
      state.error = null
      state.isLoading = true
    })
    .addCase(create.fulfilled, (state, action) => {
      state.quiz = action.payload

      state.isLoading = false
      state.createdQuizId = action.payload.id
    })
    .addCase(create.rejected, (state, action) => {
      state.error = action.error.message || null

      state.isLoading = false
    })
    .addCase(handleQuestionImageInput.fulfilled, (state, action) => {
      const quiz = {...state.quiz}

      if(action.payload?.idx !== undefined && quiz.questions[action.payload?.idx]) {
        console.log(action.payload.base64)
        quiz.questions[action.payload.idx].imageBase64 = action.payload.base64
        quiz.questions[action.payload.idx].image = action.payload.file
      }
      
      state.quiz = quiz
    })
    .addCase(fetch.fulfilled, (state, action) => {
      state.quiz = action.payload
    })
    .addCase(update.pending, (state, action) => {
      state.updated = false
    })
    .addCase(update.fulfilled, (state, action) => {
      state.updated = true
    })
    .addCase(update.rejected, (state, action) => {
      state.updated = false
    })
  }
})

export const { reset, readFromLocalStorage, setTitle, addQuestion, deleteQuestion, addAnswer, deleteAnswer, handleQuestionInput, handleAnswerInput, markAnswerAsCorrect, handleTimeToAnswerInput, toggleCategory, clearQuestionImage } = quizSlice.actions