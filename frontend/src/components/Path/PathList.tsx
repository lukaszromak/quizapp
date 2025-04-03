import { useState, useEffect } from "react"

import { axiosPrivate } from "misc/utils";
import { Typography } from "components/Misc/Typography";
import { Path } from "types";
import StyledLink from "components/Misc/StyledLink";
import { genericContainerStyle } from "components/Misc/Styles";

function PathList() {
  const [paths, setPaths] = useState<Array<Path>>([]);

  const fetchPaths = async () => {
    const response = await axiosPrivate.get('/user/paths')
    console.log(response)
    if (response.status === 200) {
      setPaths(response.data)
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
            <StyledLink to={`/path/details/${path.id}`}>
              <Typography variant="h5">{path.name}</Typography>
            </StyledLink>
          </div>
        ))}
    </div>
  )
}

export default PathList