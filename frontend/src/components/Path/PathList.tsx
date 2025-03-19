import { useState, useEffect } from "react"

import { axiosPrivate } from "misc/utils";
import { Typography } from "components/Misc/Typography";
import { Path } from "types";
import { Link } from "react-router-dom";

function PathList() {
  const [paths, setPaths] = useState<Array<Path>>([]);

  const fetchPaths = async () => {
    const response = await axiosPrivate.get('/user/paths', { withCredentials: true })
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Typography variant="h1" className="mb-2">Your Classroms</Typography>
      {paths.map((path) => (
          <div key={path.id} className="mb-2 border-2 border-dashed px-8 py-4 mb-1">
            <Link to={`/path/details/${path.id}`}>
              <Typography variant="h5">{path.name}</Typography>
            </Link>
          </div>
        ))}
    </div>
  )
}

export default PathList