import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { history } from "../helpers/history"
import { useAppSelector, useAppDispatch } from "../store"
import Button from "./Misc/Button"
import { login } from "../features/authSlice"
import ErrorMessage from "./Misc/ErrorMessage"
import StyledLink from "./Misc/StyledLink"
import { genericContainerStyle } from "./Misc/Styles"

const linkStyle = "text-blue-600 text-s italic hover:text-blue-800"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const authUser = useAppSelector(state => state.auth.user)
  const isLoading = useAppSelector(state => state.auth.isLoading)
  const registered = useAppSelector(state => state.auth.registered)
  const authError = useAppSelector(state => state.auth.error)
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (authUser) {
      const returnUrl = searchParams?.get("returnUrl")
      console.log(returnUrl)
      if(returnUrl) {
        history.navigate?.(returnUrl)
      } else {
        history.navigate?.('/')
      }
    }
  }, [authUser])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <div className={genericContainerStyle}>
      {registered ? <p className={linkStyle}>Registered successfully.</p> : ""}
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <div>
              <div className="sm:col-span-4">
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                  Email
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      id="email"
                      name="email"
                      type="text"
                      placeholder="janesmith@example.com"
                      autoComplete="email"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="password"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            {authError ? <ErrorMessage>Invalid email or username.</ErrorMessage> : ""}
            <div className="mt-2">
              <span className="font-medium leading-6 text-gray-900">Don't have an account? </span>
              {<StyledLink to="/register"><span className={linkStyle}>Register</span></StyledLink>}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button color="indigo" style="text-sm font-semibold leading-6">Log in</Button>
        </div>
      </form> 
    </div>
  )
}