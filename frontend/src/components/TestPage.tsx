import { useEffect, useState } from "react"

import { useAppDispatch, useAppSelector } from "store"
import { fetch } from "../features/testSlice"

export default function TestPage() {
    const authUser = useAppSelector(state => state.auth.user)
    const testData = useAppSelector(state => state.test.content)
    const expiresAt = useAppSelector(state => state.auth.user?.expiresAt)
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(fetch())
    }, [])

    return (
        <div>
            {expiresAt}
            {testData}
        </div>
    )
}