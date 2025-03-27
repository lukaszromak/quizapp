interface User {
    id: number,
    expiresAt: number,
    email: string,
    roles: Array<string>,
    type: string,
    username: string
    accountLocked: boolean
}

interface Answer {
    id: number|null,
    content: string,
    isValid: boolean
}

interface Question {
    id: number|null
    question: string,
    answers: Array<Answer>,
    timeToAnswer?: number,
    imagePath?: string
}

interface QuizCategory {
    id: number,
    name: string,
    quizzes: Set<Quiz>|null
}

interface Quiz {
    id: number|null
    title: string,
    questions: Array<Question>,
    categories: Array<QuizCategory>
}

interface QuizDto {
    title: string,
    questions: Array<QuestionDto>,
    categories: Array<QuizCategory>,
}

interface QuestionDto {
    question: string,
    answers: Array<Answer>,
    timeToAnswer?: number,
    image?: File,
    imageBase64?: string | null
}

enum GameEventType {
    ERROR,
    PLAYER_JOINED_GAME,
    PLAYER_RECONNECTED,
    START_GAME,
    ANSWER,
    NEW_QUESTION,
//    TIME_TO_ANSWER_ENDED,
    END_GAME,
    SCORES_UPDATE,
}

interface GameEvent {
    eventType: GameEventType,
    username?: string,
    message?: string
}

interface Game {
    gameCode: string,
    hostUsername: string,
    answerTopic: string,
    quiz: Quiz,
    currentQuestion: number,
    currentQuestionStartedAt: number,
    scores: Map<string, number>,
    answeredCurrentQuestion: Array<string>
    started: boolean
}

interface SubmittedAnswer {
    question: Question,
    answer: Answer
}

interface Solve {
    id: number,
    quiz: Quiz,
    user: Student,
    correctAnswers: number,
    totalAnswers: number,
    wasGame: boolean,
    submittedAt: Date,
    userAnswers: Array<SubmittedAnswer>
}

interface Student {
    id?: number,
    username?: string
}

interface Path {
    id: number | null,
    name: string,
    students: Array<Student>,
    quizzes: Array<Quiz>,
    teachers: Array<string>,
    assignments: Array<Assignment>
}

interface doExistResponse {
    id?: number,
    username?: number,
    exists: boolean
}

interface Assignment {
    id: number | null,
    name: string
    pathId: number,
    quizId: number,
    solves: Array<Solve>,
    startDate: Date,
    expirationDate: Date,
    isSynchronous: boolean,
    allowAsynchronousSubmission: boolean,
    allowSubmitAfterExpiration: boolean
}

export {
    GameEventType
}

export type {
    User,
    Answer,
    Question,
    QuizCategory,
    Quiz,
    QuizDto,
    GameEvent,
    Game,
    SubmittedAnswer,
    Solve,
    Path,
    doExistResponse,
    Student,
    Assignment
}