import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Client } from "@stomp/stompjs"
import { useLocation } from "react-router-dom"

import { config } from "misc/constants"
import { axiosPrivate } from "misc/utils"
import BigTextContainer from "components/Misc/BigTextContainer"
import { GameEvent, GameEventType, Game, Question } from "types"
import Button from "components/Misc/Button"
import { Typography } from "components/Misc/Typography"
import UsernamesDisplay from "./UsernamesDisplay"
import { axiosPublic } from "misc/utils"
import ScoresDisplay from "./ScoresDisplay"

function HostPanel() {
  const { id } = useParams()
  const [gameCode, setGameCode] = useState("")
  const [players, setPlayers] = useState<Array<string>>(new Array<string>())
  const [lastMessage, setLastMessage] = useState("")
  const [client, setClient] = useState<Client | null>(null)
  const [scores, setScores] = useState(new Map<string, number>())
  const [displayScores, setDisplayScores] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [timeToAnswer, setTimeToAnswer] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)
  const [answersTopic, setAnswerTopic] = useState("")
  const [error, setError] = useState("")
  const location = useLocation()

  const connectToWebSocket = (gameId: string): Client => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/api/ws',
      onConnect: (frame) => {
        console.log(frame.headers)
        setError("")

        console.log('Connected to websocket')

        client.subscribe(`/user/${answersTopic}/queue/reply`, message => {
          const gameEvent = JSON.parse(message.body) as GameEvent
          if(gameEvent.message) setCurrentAnswer(gameEvent.message)
        })

        client.subscribe(`/topic/${gameId}`, message => {
          const gameEvent = JSON.parse(message.body) as GameEvent
          switch (gameEvent.eventType) {
            case GameEventType.PLAYER_JOINED_GAME:
            case GameEventType.PLAYER_RECONNECTED:
              if (gameEvent.username) {
                setLastMessage(`${gameEvent.username} ${gameEvent.eventType === GameEventType.PLAYER_JOINED_GAME ? "joined" : "reconnected"}.`)
                const idx = players.indexOf(gameEvent.username)
                if (idx === -1) {
                  setPlayers([...players, gameEvent.username])
                }
              }
              break;
            case GameEventType.NEW_QUESTION:
              const question = gameEvent.message ? JSON.parse(gameEvent.message) as Question : null
              if (question?.timeToAnswer) {
                setTimeToAnswer(question.timeToAnswer)
              }
              setDisplayScores(false)
              setCurrentQuestion(question)
              break
            case GameEventType.SCORES_UPDATE:
              const obj = gameEvent.message ? JSON.parse(gameEvent.message) : null
              const scores = new Map(Object.entries(obj)) as Map<string, number>
              if (scores) {
                setScores(scores)
              }
              break
            case GameEventType.END_GAME:
              const obj2 = gameEvent.message ? JSON.parse(gameEvent.message) : null
              const finalScores = new Map(Object.entries(obj2)) as Map<string, number>
              if (finalScores) {
                setScores(finalScores)
                setGameEnded(true)
              }
              break
          }
        })
      },
      onWebSocketError: reconnect
    });

    client.activate();

    return client
  }

  const createGame = async () => {
    const gameHostedResponse = await axiosPrivate.get("/game/hostedGame", { withCredentials: true })

    if (gameHostedResponse.status === 200) {
      if (gameHostedResponse.data === "") {
        const gameCodeResponse = await axiosPrivate.get(`/game/create/${id}${location?.state?.assignmentId ? `?assignmentId=${location.state.assignmentId}` : ""}`, { withCredentials: true })
        if (gameCodeResponse.data === "") {
          console.log("Error while creating game")
        } else {
          setGameCode(gameCodeResponse.data.gameCode)
          console.log(gameCodeResponse.data.answerTopic)
          setAnswerTopic(gameCodeResponse.data.answerTopic)
        }
      } else {
        const game = gameHostedResponse.data as Game
        const questionElapsedTime = Math.floor((Date.now() - game.currentQuestionStartedAt) / 1000)
        const currentQuestion = game.quiz.questions[game.currentQuestion - 1]

        game.scores = new Map(Object.entries(game.scores))
        setGameCode(game.gameCode)
        console.log(game.answerTopic)
        setAnswerTopic(game.answerTopic)
        setPlayers(Array.from(game.scores.keys()))

        if(!currentQuestion) return

        const currentQuestionTimeToAnswer = (!currentQuestion.timeToAnswer || currentQuestion.timeToAnswer == 0) ? 10 : currentQuestion.timeToAnswer

        if(questionElapsedTime >= currentQuestionTimeToAnswer) {
          setDisplayScores(true)
        } else {
          setCurrentQuestion(currentQuestion)
          setTimeToAnswer(questionElapsedTime)
        }
      }
    }
  }

  const startGame = async () => {
    const body: GameEvent = {
      eventType: GameEventType.START_GAME
    }

    if (client) {
      client.publish({ destination: `/app/game/${gameCode}`, body: JSON.stringify(body) })
    } else {
      console.log("Client object not set.")
    }
  }

  const reconnect = () => {
    setError("Lost connection with server, trying to reconnect...");
    (async () => {
      try {
        await axiosPublic.post('/auth/refreshtoken', {}, { withCredentials: true })
      } catch (error) {
        console.log(error)
      }
    })()
  }

  useEffect(() => {
    if (gameCode !== "") {
      const client = connectToWebSocket(gameCode)
      setClient(client)
      return () => {
        setClient(null)
        client.deactivate()
      }
    }
  }, [gameCode])

  useEffect(() => {
    if (timeToAnswer <= 0 && client) {
      setDisplayScores(true)
    }
    if (timeToAnswer > 0) {
      const timeout = setTimeout(() => setTimeToAnswer(timeToAnswer - 1), 1000)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [timeToAnswer])

  useEffect(() => {
    createGame()
  }, [])

  return (
    (gameEnded || displayScores)
      ?
      <>
        <BigTextContainer>
          {gameEnded ? <Typography variant="h1">Game ended.</Typography> : <Typography variant="h1">{currentAnswer}</Typography>}
          <ScoresDisplay scores={scores} />
        </BigTextContainer>
      </>
      :
      currentQuestion ?
        <BigTextContainer size={1}>
          {currentQuestion.imagePath ? <img src={`${config.url.STORAGE_BASE_URL}${currentQuestion.imagePath}`}/> : <></>}
          <Typography variant="h1">{currentQuestion.question}</Typography>
          <ScoresDisplay scores={scores} />
          <span></span>
        </BigTextContainer>
        :
        <BigTextContainer size={1}>
          {client ? <p>{location?.state?.assignmentName && `${location.state.assignmentName}`}</p> : <p>"Connecting..."</p>}
          <div className="text-center">Enter this code to join</div>
          <div className="mb-5">{gameCode}</div>
          <UsernamesDisplay usernames={players} />
          <div className="text-center mb-5">{lastMessage}</div>
          <Button color="blue" onClick={() => startGame()}>START QUIZ</Button>
        </BigTextContainer>
  )
}

export default HostPanel