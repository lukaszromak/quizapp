import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { axiosPrivate } from '../misc/utils';

interface GameState {
    content: string,
    isLoading: boolean
}

const name = 'game'

export const fetch = createAsyncThunk(
    `${name}/fetch`,
    async () => {
        const response = await axiosPrivate.get('/auth/test/user')
        return response.data
    }
)

export const testSlice = createSlice({
    name: name,
    initialState: {content: "", isLoading: false},
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetch.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(fetch.fulfilled, (state, action) => {
            const content = action.payload

            state.content = content

            state.isLoading = false
        })
        builder.addCase(fetch.rejected, (state) => {
            state.isLoading = false
        })
    }
})