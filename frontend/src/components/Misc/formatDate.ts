const formatDate = (date: Date, humanFormat: boolean) => {
  const year = date.getFullYear()
  const month = date.getMonth() >= 10 ? date.getMonth() : `0${date.getMonth()}`
  const day = date.getDay() >= 10 ? date.getDay() : `0${date.getDay()}`
  const hour = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`
  const minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`

  if(humanFormat) {
    return `${hour}:${minutes} ${day}.${month}.${year} `
  }

  return `${year}-${month}-${day}T${hour}:${minutes}`
}

export default formatDate