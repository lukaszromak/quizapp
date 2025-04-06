import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useAppSelector } from "store"
import { User } from "types"
import { axiosPrivate } from "helpers/utils"
import { genericContainerStyle } from "components/Misc/Styles"
import ErrorMessage from "components/Misc/ErrorMessage"
import PaginationBar from "components/Misc/PaginationBar"
import Button from "components/Misc/Button"

const roles = ["ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"]

function UserList() {
  const authUser = useAppSelector(state => state.auth.user)
  const navigate = useNavigate()
  const [users, setUsers] = useState<Array<User>>([])
  const [fetchError, setFetchError] = useState("")
  const [textSearch, setTextSearch] = useState("")
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const fetchUsers = async () => {
    setFetchError("")

    try {
      const response = await axiosPrivate.get(`/user?page=${currentPage}&searchText=${textSearch}`)
      const data = response.data.content

      for (let i = 0; i < data.length; i++) {
        data[i].roles = data[i].roles.map((role: { name: any }) => role.name)
      }

      setNumPages(response.data.totalPages)
      setCurrentPage(response.data.pageable.pageNumber)
      setUsers(data)
    } catch (error) {
      console.log(error)
      setFetchError("Error while fetching users.")
    }
  }

  const updateUser = async (userId: number, updatedUser: User) => {
    try {
      const user = users.find(u => u.id === userId)

      if(!user) return

      user.accountLocked = updatedUser.accountLocked
      user.roles = updatedUser.roles

      const response = await axiosPrivate.put(`/user/${userId}`, user)
      response.data.roles = response.data.roles.map((role: { name: any }) => role.name)
      setUsers([...users.filter(u => u.id !== response.data.id), response.data])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!authUser || !authUser.roles.includes("ROLE_ADMIN")) navigate("/")
    fetchUsers()
  }, [authUser, currentPage])

  return (
    <div className={genericContainerStyle}>
      {fetchError.length > 0 && <ErrorMessage>{fetchError}</ErrorMessage>}
      <input
        value={textSearch}
        onInput={(e) => setTextSearch(e.currentTarget.value)}
        className="w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 p-2 mb-2" />
      <Button color="blue" style="w-full mb-5" onClick={() => fetchUsers()}>search</Button>
      {users.length == 0
        ?
        <>
          <table className="w-full table-auto border border-gray-400 my-5">
            <thead>
              <tr>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Id</td>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Name</td>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Email</td>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Roles</td>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Account locked</td>
              </tr>
            </thead>
          </table>
          <ErrorMessage>No users found.</ErrorMessage>
        </>
        :
        <>
          <PaginationBar
            currentPage={currentPage}
            numPages={numPages}
            setCurrentPage={setCurrentPage} />
          <table className="w-full table-auto border border-gray-400 my-5">
            <thead>
              <tr>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Id</td>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Name</td>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Email</td>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Roles</td>
                <td className="border border-gray-300 p-2 text-left bg-gray-100">Account locked</td>
              </tr>
            </thead>
            <tbody>
              {users.toSorted((u1, u2) => u1.username.localeCompare(u2.username)).map(user => (
                <tr key={user.id}>
                  <td className="border border-gray-300 p-2">{user.id}</td>
                  <td className="border border-gray-300 p-2">{user.username}</td>
                  <td className="border border-gray-300 p-2">{user.email}</td>
                  <td className="border border-gray-300 p-2">
                    <span className="flex justify-between">
                      <span>
                        {user.roles.map(role => `${role} `)}
                      </span>
                      {user.roles.includes("ROLE_MODERATOR") ? <Button color="red" onClick={() => updateUser(user.id, {...user, roles: [...user.roles.filter(r => r !== "ROLE_MODERATOR")]})}>Remove teacher role</Button> : <Button color="green" onClick={() => updateUser(user.id, {...user, roles: [...user.roles, "ROLE_MODERATOR"]})}>Assign teacher role</Button>}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <span className="flex justify-between">
                      <span>
                        {user.accountLocked ? "Yes" : "No"}
                      </span>
                      <span className="ml-2">
                        {user.accountLocked ? <Button color="green" onClick={() => updateUser(user.id, {...user, accountLocked: !user.accountLocked})}>unlock</Button> : <Button color="red" onClick={() => updateUser(user.id, {...user, accountLocked: !user.accountLocked})}>lock</Button>}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationBar
            currentPage={currentPage}
            numPages={numPages}
            setCurrentPage={setCurrentPage} />
        </>}
    </div>
  )
}

export default UserList