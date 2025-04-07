import { useState, useEffect, useRef } from "react"
import { useAppSelector } from "store"

import Donut from "./Donut"
import { axiosPrivate } from "helpers/utils"
import { Solve } from "types"
import { Typography } from "components/Misc/Typography"

const colors = [
  "#4CAF50",
  "#FF9800",
  "#F44336",
  "#2196F3",
  "#9C27B0",
  "#00BCD4",
  "#FFC107",
  "#607D8B",
  "#795548",
  "#E91E63",
  "#3F51B5",
  "#8BC34A",
  "#CDDC39",
  "#673AB7",
  "#FF5722",
  "#009688",
];


function SolvedQuizesDashboard() {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const user = useAppSelector(state => state.auth.user)
  const [solves, setSolves] = useState(new Array<Solve>())
  const [solvesByType, setSolvesByType] = useState(new Map<string, number>())
  const [solvesByCategory, setSolvesByCategory] = useState(new Map<string, number>())
  const [solvesByScores, setSolvesByScores] = useState(new Map<string, number>())

  const fetchSolves = async () => {
    try {
      const response = await axiosPrivate.get(`/user/${user?.id}/solves`)

      if(response.status === 200) {
        const solves = response.data as Array<Solve>
        setSolves(solves)
      }
    } catch(error) {

    }
  }

  useEffect(() => {
    console.log(solvesByType)
  }, [solvesByType])

  useEffect(() => {
    if(!solves || !solves.length) return

    const solvesByType = new Map<string, number>()
    solvesByType.set("Games", solves.reduce((prev, curr) => curr.wasGame ? prev + 1 : prev, 0))
    solvesByType.set("Quizes", solves.reduce((prev, curr) => !curr.wasGame ? prev + 1 : prev, 0))

    const solvesByCategory = new Map<string, number>()
    console.log(solves)
    for(let i = 0; i < solves.length; i++) {
      console.log(solves[i].quiz)
      for(let j = 0; j < solves[i].quiz.categories.length; j++) {
        const value = solvesByCategory.get(solves[i].quiz.categories[j].name)
        if(value) {
          solvesByCategory.set(solves[i].quiz.categories[j].name, value + 1)
        } else {
          solvesByCategory.set(solves[i].quiz.categories[j].name, 1)
        }
      }
    }

    const scoresRanges: any = [[0, 25, "0-25%"], [25, 50, "25-50%"], [50, 75, "50-75%"], [76, 100, "75%-100%"]]
    const solvesByScores = new Map<string, number>()
    for(let i = 0; i < solves.length; i++) {
      const score = ((solves[i].correctAnswers / solves[i].totalAnswers) * 100)
      for(let k = 0; k < scoresRanges.length; k++) {
        if(score >= scoresRanges[k][0] && score < scoresRanges[k][1]) {
          const value = solvesByScores.get(scoresRanges[k][2])
          if(value) {
            solvesByScores.set(scoresRanges[k][2], value + 1)
          } else {
            solvesByScores.set(scoresRanges[k][2], 1)
          }
        }
      }
    }


    setSolvesByType(solvesByType)
    setSolvesByCategory(solvesByCategory)
    setSolvesByScores(solvesByScores)
  }, [solves])

  useEffect(() => {
    if(user) fetchSolves()
  }, [user])

  useEffect(() => {
    const current = ref?.current

    if(current) {
      const resizeObserver = new ResizeObserver((event) => {
        setWidth(current.clientWidth)
      })

      resizeObserver.observe(current)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [ref])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div ref={ref}>
        <Typography variant="p">Total solved</Typography>
        <Donut data={solvesByType} colors={colors} width={width} hoverSpread={10}/>
      </div>
      <div>
      <Typography variant="p">Solved by category</Typography>
        <Donut data={solvesByCategory} colors={colors} width={width} hoverSpread={10}/>
      </div>
      <div>
      <Typography variant="p">Solved by scores</Typography>
        <Donut data={solvesByScores} colors={colors} width={width} hoverSpread={10}/>
      </div>
    </div>
  )
}

export default SolvedQuizesDashboard