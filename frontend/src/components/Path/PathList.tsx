import { useState, useEffect } from "react"

import { axiosPrivate } from "helpers/utils";
import { Typography } from "components/Misc/Typography";
import { Path } from "types";
import StyledLink from "components/Misc/StyledLink";
import { genericContainerStyle } from "components/Misc/Styles";
import Button from "components/Misc/Button";
import { useAppSelector } from "store";

function PathList() {
  const [paths, setPaths] = useState<Array<Path>>([]);
  const authUser = useAppSelector(state => state.auth.user)
  const [deleteError, setDeleteError] = useState("")

  const fetchPaths = async () => {
    const response = await axiosPrivate.get('/user/paths')
    console.log(response)
    if (response.status === 200) {
      setPaths(response.data)
    }
  }

  const deletePath = async (id: number | null) => {
    if(!id) return

    setDeleteError("")

    try {
      await axiosPrivate.delete(`/path/${id}`)
      setPaths(paths.filter(path => path.id !== id))
    } catch (error) {
      console.log(error)
      setDeleteError("Error while deleting quiz.")
    }
  }

  useEffect(() => {
    fetchPaths()
  }, [])

  console.log(paths)

  return (
    <div className={genericContainerStyle}>
      <Typography variant="h1" className="mb-2">Your Quiz Paths</Typography>
      {paths.map((path) => (
          <div key={path.id} className="mb-2 border-2 border-dashed px-8 py-4 mb-1">
            <span className="flex justify-between">
              <StyledLink to={`/path/details/${path.id}`}>
                <Typography variant="h5">{path.name}</Typography>
              </StyledLink>
              {(authUser?.roles.includes("ROLE_MODERATOR") || authUser?.roles.includes("ROLE_ADMIN")) &&
              <Button color="red" onClick={() => deletePath(path.id)}>Delete</Button>}
            </span>
          </div>
        ))}
    </div>
  )
}

export default PathList