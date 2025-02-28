export {
    login,
    logout,
    refreshToken,
    authSlice
} from "./authSlice"

export {
    fetch,
    testSlice
} from "./testSlice"

export {
    reset,
    quizSlice,
    create,
    setTitle,
    readFromLocalStorage, 
    addQuestion, 
    deleteQuestion, 
    addAnswer, 
    deleteAnswer, 
    handleQuestionInput, 
    handleAnswerInput,
    markAnswerAsCorrect,
    handleTimeToAnswerInput,
    handleQuestionImageInput,
    toggleCategory,
    clearQuestionImage
} from "./createQuizSlice"

export {
    quizCategorySlice,
} from "./quizCategorySlice"

export {
    readQuizSlice
} from "./readQuizSlice"