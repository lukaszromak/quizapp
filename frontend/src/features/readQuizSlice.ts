import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { axiosPublic } from '../misc/utils';
import { Quiz } from 'types';

interface State {
    quiz: Quiz,
    isLoading: boolean
}

const name = 'readQuiz'

export const fetchQuiz = createAsyncThunk(
    `${name}/fetch`,
    async (id: number) => {
        const response = await axiosPublic.get(`/quiz/${id}`)
        return response.data
    }
)

const initialState: State = {
    quiz: {
        id: null,
        title: "",
        questions: [],
        categories: []
    },
    isLoading: false
}

export const readQuizSlice = createSlice({
    name: name,
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchQuiz.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(fetchQuiz.fulfilled, (state, action) => {
            const content = action.payload

            state.quiz = content

            state.isLoading = false
        })
        builder.addCase(fetchQuiz.rejected, (state) => {
            state.isLoading = false
        })
    }
})