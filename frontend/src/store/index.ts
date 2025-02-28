import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux';
import { authSlice, testSlice, quizSlice, quizCategorySlice, readQuizSlice } from '../features';

export const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [testSlice.name]: testSlice.reducer,
    [quizSlice.name]: quizSlice.reducer,
    [quizCategorySlice.name]: quizCategorySlice.reducer,
    [readQuizSlice.name]: readQuizSlice.reducer
  }
})

// Get the type of our store variable
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()