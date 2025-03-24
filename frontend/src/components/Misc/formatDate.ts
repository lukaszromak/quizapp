const formatDate = (date: Date, humanFormat: boolean) => {
  const monthFrom1 = date.getMonth() + 1
  const dayFrom1 = date.getDate()

  const year = date.getFullYear()
  const month = monthFrom1 >= 10 ? monthFrom1 : `0${monthFrom1}`
  const day = dayFrom1 >= 10 ? dayFrom1: `0${dayFrom1}`
  const hour = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`
  const minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`

  if(humanFormat) {
    return `${hour}:${minutes} ${day}.${month}.${year} `
  }

  return `${year}-${month}-${day}T${hour}:${minutes}`
}

export default formatDate