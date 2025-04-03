import { useEffect, useState, useRef } from "react"
import DonutLegend from "./DonutLegend"

interface Coords {
  x: number,
  y: number
}

function Donut({ data, colors, width, thickness, hoverSpread }: { data: Map<string, number>, colors: Array<string>, width: number, thickness?: number, hoverSpread?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hover, setHover] = useState("Nothing xd")
  const [x1, setX1] = useState(0)
  const [y1, setY1] = useState(0)
  const [atan2, setAtan2] = useState(0)

  const drawDonut = (ctx: CanvasRenderingContext2D, donutWidth: number, donutCenter: Coords, donutThickness: number, data: Map<string, number>, dataSelected?: number) => {
    const dataValues = Array.from(data.entries())
    const dataTotal = dataValues.reduce((prev, curr) => prev + curr[1], 0)
    let currentAngle = 0
    let dataPortion
    let currentColor = 0
    
    const donutRadius = hoverSpread ? (donutWidth / 2) - (donutThickness / 2) - (hoverSpread / 2) : (donutWidth / 2) - (donutThickness / 2)
    ctx.font = "24px sans-serif";

    for (let i = 0; i < dataValues.length; i++) {
      dataPortion = (dataValues[i][1] / dataTotal) * 2 * Math.PI

      ctx.beginPath()

      ctx.strokeStyle = colors[currentColor]
      
      if(dataSelected == i && hoverSpread) {
        ctx.lineWidth = donutThickness + hoverSpread
        ctx.arc(donutCenter.x, donutCenter.y, donutRadius + hoverSpread / 2 , currentAngle, currentAngle + dataPortion)
      } else {
        ctx.lineWidth = donutThickness
        ctx.arc(donutCenter.x, donutCenter.y, donutRadius, currentAngle, currentAngle + dataPortion)
      }

      ctx.stroke()

      if(dataSelected == i) {
        ctx.textAlign = "center"
        ctx.fillStyle = "white"
        ctx.fillText(`${dataValues[i][1].toString()}`, Math.cos(currentAngle + dataPortion / 2) * donutRadius + donutCenter.x, Math.sin(currentAngle + dataPortion / 2) * donutRadius + donutCenter.y)
        ctx.fillStyle = colors[currentColor]
        ctx.fillText(dataValues[i][0], donutCenter.x, donutCenter.y)
      }

      currentAngle += dataPortion
      currentColor = (currentColor + 1) % colors.length
    }
  }

  const clearCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")

    if(!ctx) return

    ctx.fillStyle = "white"
    const width = canvas.width
    const height = canvas.height

    ctx?.fillRect(0, 0, width, height)
  }

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (!ctx || !width) return

    const dataValues = Array.from(data.values())
    const donutWidth = hoverSpread ? width - hoverSpread : width
    const donutHeight = hoverSpread ? width - hoverSpread : width
    const donutThickness = thickness ? thickness : donutWidth / 4
    const donutCenter: Coords = { x: hoverSpread ? (donutWidth + hoverSpread) / 2 : donutWidth / 2, y: hoverSpread ? (donutWidth + hoverSpread) / 2 : donutHeight / 2 }

    drawDonut(ctx, donutWidth, donutCenter, donutThickness, data)

    canvas.addEventListener("mousemove", (event) => {
      const x1 = event.offsetX
      const y1 = event.offsetY
      const x2 = donutCenter.x
      const y2 = donutCenter.y

      const distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))

      setX1(x1)
      setY1(y1)

      if (distance > (donutWidth / 2) || distance < (donutWidth / 2) - donutThickness) {
        setHover("Nothing xd")
        clearCanvas(canvas)
        drawDonut(ctx, donutWidth, donutCenter, donutThickness, data)
        return
      }

      let atan2 = Math.atan2(y1 - (donutWidth / 2), x1 - (donutWidth / 2))
      if(atan2 < 0) {
        atan2 = Math.PI * 2 + atan2
      }
      setAtan2(atan2)

      const dataTotal = dataValues.reduce((prev, curr) => prev + curr, 0)
      let currentAngle = 0
      let dataPortion = 0
      let currentColor = 0

      for (let i = 0; i < dataValues.length; i++) {
        dataPortion = (dataValues[i] / dataTotal) * 2 * Math.PI
        if (atan2 >= currentAngle && atan2 <= currentAngle + dataPortion) {
          setHover(colors[currentColor])
          clearCanvas(canvas)
          drawDonut(ctx, donutWidth, donutCenter, donutThickness, data, i)
          return
        }
        currentColor = (currentColor + 1) % colors.length
        currentAngle += dataPortion
      }
    })
  }, [width, data])

  return (
    <>
      {/* <p>{x1}, {y1}, {atan2}</p>
      <p>{hover}</p> */}
      <canvas width={hoverSpread ? hoverSpread + width : width} height={hoverSpread ? hoverSpread + width : width} ref={canvasRef}>
      </canvas>
      <DonutLegend data={data} colors={colors}/>
    </>
  )
}

export default Donut