import { useState, useEffect } from "react"

import { axiosPrivate } from "misc/utils";

function PathList() {
    const [paths, setPaths] = useState([]);

    const fetchPaths = async() => {
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
        <></>
    )
}

export default PathList