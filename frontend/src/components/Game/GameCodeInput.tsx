import { useState } from "react"

function GameCodeInput({ length }: { length: number }) {
  const [gameCode, setGameCode] = useState("")

  return (
    <div className="flex">
      {[...Array(length)].map((_, i) => (
        <div key={i} className="">
          <input
            name=``
        </div>
      ))}
    </div>
  )
}

export default GameCodeInput