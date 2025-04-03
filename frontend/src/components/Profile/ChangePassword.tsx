import { useState } from "react"

import Button from "components/Misc/Button"
import { axiosPrivate } from "misc/utils"
import ErrorMessage from "components/Misc/ErrorMessage"
import SuccessMessage from "components/Misc/SuccessMessage"
import { AxiosError } from "axios"
import { genericContainerStyle } from "components/Misc/Styles"

interface ChangePasswordRequest {
  oldPassword: string,
  newPassword: string
}

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [successInfo, setSuccessInfo] = useState("")
  const [errorInfo, setErrorInfo] = useState("")

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const body: ChangePasswordRequest = {
      oldPassword: oldPassword,
      newPassword: newPassword
    }

    try {
      const response = await axiosPrivate.post("/auth/changePassword", body)

      if(response.status === 200) {
        setErrorInfo("")
        console.log(response.data)
        setSuccessInfo(response.data)
      }
    } catch(err) {
      setSuccessInfo("")

      let message = "Error while changing password"

      if(err instanceof AxiosError) {
        message = err.response?.data.message
        if(err.response?.data.message.startsWith("Validation failed")) message = "Error while changing password"
      }

      setErrorInfo(message)
    }
  }

  return (
    <div className={genericContainerStyle}>
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <div>
              <div className="sm:col-span-4">
                <label htmlFor="old-password" className="block text-sm font-medium leading-6 text-gray-900">
                  Old password
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      id="old-password"
                      name="old-password"
                      type="password"
                      placeholder=""
                      autoComplete="password"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="new-password" className="block text-sm font-medium leading-6 text-gray-900">
                  New password
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            {successInfo !== "" && <SuccessMessage>{successInfo}</SuccessMessage>}
            {errorInfo !== "" && <ErrorMessage>{errorInfo}</ErrorMessage>}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button color="indigo" style="text-sm font-semibold leading-6">Save</Button>
        </div>
      </form>
    </div>
  )
}

export default ChangePassword