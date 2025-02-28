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

interface Solve {
    id: number,
    quiz: Quiz,
    userId: number,
    correctAnswers: number,
    totalAnswers: number,
    wasGame: boolean
}

interface Path {
    id: number | null,
    students: Array<string>,
    quizzes: Array<Quiz>,
    teachers: Array<string>
}

export {
    GameEventType
}

export type {
    Answer,
    Question,
    QuizCategory,
    Quiz,
    QuizDto,
    GameEvent,
    Game,
    Solve,
    Path
}