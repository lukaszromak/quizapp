import { useEffect, useState } from "react"
import { Client } from "@stomp/stompjs"

import BigTextContainer from "components/Misc/BigTextContainer"
import { GameEvent } from "types"
import { GameEventType } from "types"
import { axiosPublic, axiosPrivate } from "misc/utils"

import { Question } from "types"
import Button from "components/Misc/Button"
import { Typography } from "components/Misc/Typography"
import ErrorMessage from "components/Misc/ErrorMessage"

//{ id: null, question: "Lubisz spuche?", answers: [{ id: null, content: "Jeszcze jak", isValid: true }, { id: null, content: "nie TROLL", isValid: false }, { id: null, content: "pojebalo cie?", isValid: false },  { id: null, content: "debil...", isValid: false }] }

function PlayerPanel() {
  const [gameCode, setGameCode] = useState("")
  const [tryConnect, setTryConnect] = useState(false)
  const [alreadyInGame, setAlreadyInGame] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answer, setCurrentAnswer] = useState("")
  const [client, setClient] = useState<null | Client>(null)
  const [scores, setScores] = useState(new Map<string, number>())
  const [displayScores, setDisplayScores] = useState(false)
  const [timeToAnswer, setTimeToAnswer] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)
  const [error, setError] = useState("")

  const connectToWebSocket = (gameId: string): Client => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/api/ws',
      onConnect: () => {
        setError("")

        console.log('Connected to websocket')

        const body: GameEvent = {
          eventType: GameEventType.PLAYER_JOINED_GAME
        }
        client.publish({ destination: `/app/game/${gameId}`, body: JSON.stringify(body) })

        client.subscribe(`/topic/${gameId}`, message => {
          const gameEvent = JSON.parse(message.body) as GameEvent
          console.log(gameEvent)
          switch (gameEvent.eventType) {
            case GameEventType.ERROR:
              if (gameEvent.message === "Game not found.") {
                setError("Game not found, Make sure entered code is correct and retry joining.")
              }
              client.deactivate()
              setClient(null)
              break
            case GameEventType.NEW_QUESTION:
              const question = gameEvent.message ? JSON.parse(gameEvent.message) as Question : null
              console.log(question)
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
              const finalScores = gameEvent.message ? JSON.parse(gameEvent.message) as Map<string, number> : null
              if (finalScores) {
                setScores(finalScores)
                setGameEnded(true)
              }
              break
          }
        });
      },
      onWebSocketError: reconnect
    });

    client.activate();

    return client
  }

  const checkIsInGame = async () => {
    try {
      const response = await axiosPrivate.get("/game/currentGame", { withCredentials: true })

      if (response.status === 200) {
        if (response.data !== "") {
          setGameCode(response.data)
          setTryConnect(true)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const sendAnswer = (answerId: number | null) => {
    if (client) {
      const body: GameEvent = {
        eventType: GameEventType.ANSWER,
        message: answerId?.toString()
      }

      client.publish({ destination: `/app/game/${gameCode}`, body: JSON.stringify(body) })
    } else {
      console.log("No client handle while trying to send answer.")
    }
  }

  const resetPanel = () => {
    client?.deactivate()
    setGameCode("")
    setTryConnect(false)
    setAlreadyInGame(false)
    setCurrentQuestion(null)
    setClient(null)
    setScores(new Map<string, number>())
    setDisplayScores(false)
    setTimeToAnswer(0)
    setGameEnded(false)
    checkIsInGame()
  }

  const reconnect = async () => {
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
    if (tryConnect) {
      const client = connectToWebSocket(gameCode)
      console.log(client)
      setClient(client)
      return () => {
        console.log("Client set to null")
        setClient(null)
        client.deactivate()
      }
    }
  }, [tryConnect])

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
    checkIsInGame()
  }, [])

  return (
    (gameEnded || displayScores)
      ?
      gameEnded
        ?
        <BigTextContainer>
          <Typography variant="h1">Game Ended</Typography>
          <button onClick={() => resetPanel()}>Play again</button>
        </BigTextContainer>
        :
        <Typography variant="h1">Displaying scores on host panel.</Typography>
      :
      currentQuestion
        ?
        <>
          <p>{timeToAnswer}</p>
          <p>{JSON.stringify(scores)}</p>
          <p>{displayScores ? "DISPLAY" : "NO DISPLAY"}</p>
          <div className="mx-auto max-w-3xl px-4 py-8 gap-0 columns-2 h-screen">
            {currentQuestion.answers.map((answer, idx) => (
              <div className={`flex justify-center items-center border-4 border-gray-800 hover:bg-gray-300 ${idx < 2 && `border-r-0`} ${idx % 2 == 1 && `border-t-0`} h-2/6 text-balance text-center`} key={answer.id} onClick={() => sendAnswer(answer.id)}>
                <Typography variant="p">{answer.content}</Typography>
              </div>
            ))}
          </div>
        </>
        :
        <BigTextContainer size={1}>
          <p>{client ? "CLIENT" : "NO CLIENT"}</p>
          <div>Enter game code</div>
          <input className="text-center" value={gameCode} onChange={(e) => setGameCode(e.currentTarget.value)} />
          {error !== "" ? <ErrorMessage>{error}</ErrorMessage> : <p></p>}
          <Button color="blue" onClick={() => setTryConnect(true)}>enter</Button>
        </BigTextContainer>
  )
}

export default PlayerPanel