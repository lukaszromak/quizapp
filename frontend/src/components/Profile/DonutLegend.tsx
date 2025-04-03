function DonutLegend({ data, colors }: { data: Map<string, number>, colors: Array<string> }) {
  let currentColor = -1
  
  return (
    <div className="text-right">
      {Array.from(data.entries()).map((entry) => {
        console.log(entry)
        currentColor = (currentColor + 1) % colors.length
        console.log({color: colors[currentColor]})
        return (
          <span className="text-xl" key={entry[0]} style={{color: colors[currentColor]}}>{entry[0]} </span>
        )
      })}
    </div>
  )
}

export default DonutLegend