import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { axiosPublic } from '../helpers/utils';
import { QuizCategory } from 'types';

interface State {
    isLoading: boolean,
    // using array of strings in format `${id}:${color}` to avoid using nonserializable map<string,string>
    colorMap: Array<string>
    quizCategories: Array<QuizCategory>
}

const categoriesColors = [
    'bg-violet-700',
    'bg-indigo-700',
    'bg-sky-500',
    'bg-green-500',
    'bg-yellow-400',
    'bg-orange-500',
    'bg-red-600'
]

const name = 'quizCategory'

export const fetchQuizCategory = createAsyncThunk(
    `${name}/fetch`,
    async () => {
        const response = await axiosPublic.get('/quizCategory')
        return response.data
    }
)

const initialState: State = {
    isLoading: false,
    colorMap: new Array<string>(),
    quizCategories: new Array<QuizCategory>()
}

export const quizCategorySlice = createSlice({
    name: name,
    initialState: initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetchQuizCategory.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(fetchQuizCategory.fulfilled, (state, action) => {
            const content = action.payload

            const colorMap = new Array<string>();
        
            for (let i = 0; i < content.length; i++) {
              colorMap.push(`${content[i].id}:${categoriesColors[i % categoriesColors.length]}`)
            }

            state.colorMap = colorMap
            state.quizCategories = content

            state.isLoading = false
        })
        builder.addCase(fetchQuizCategory.rejected, (state) => {
            state.isLoading = false
        })
    }
})