import { createAsyncThunk, createReducer, createSlice } from '@reduxjs/toolkit';

import { axiosPrivate, axiosPublic } from '../misc/utils';
import { history } from '../helpers/history';

interface User {
    id: number,
    expiresAt: number,
    email: string,
    roles: Array<string>,
    type: string,
    username: string
}

interface AuthState {
    user: User | null,
    error: string | null,
    isLoading: boolean,
    registered: boolean 
}

const name = 'auth';

export const login = createAsyncThunk(
    `${name}/login`,
    async (user: { email: string, password: string }) => {
        const response = await axiosPublic.post('/auth/signin', user, { withCredentials: true });
        return response.data
    }
)

export const logout = createAsyncThunk(
    `${name}/logout`,
    async (_, getState) => {
        const response = await axiosPrivate.post('/auth/signout', {}, { withCredentials: true });
        return response.data
    }
)

export const refreshToken = createAsyncThunk(
    `${name}/refreshtoken`,
    async (_, { getState }) => {
        const response = await axiosPublic.post('/auth/refreshtoken', {}, { withCredentials: true })
        return response.data
    }
)

export const register = createAsyncThunk(
    `${name}/signup`,
    async(signupRequest: { username: string, email: string, password: string}) => {
        const response = await axiosPublic.post('/auth/signup', signupRequest)
        return response.data
    }
)

const initialState : AuthState = {
    user: JSON.parse(localStorage?.getItem("user") as string),
    error: null,
    isLoading: false,
    registered: false
}

export const authSlice = createSlice({
    name: name,
    initialState,
    reducers: {
        toggleRegistered(state) {
            state.registered = !state.registered
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.error = null

            state.isLoading = true
        })
        .addCase(login.fulfilled, (state, action) => {
            localStorage.setItem('user', JSON.stringify(action.payload));
            state.user = action.payload;

            // const { from } = history.location?.state || { from: { pathname: '/' } }
            // history.navigate?.(from)

            state.isLoading = false
        })
        .addCase(login.rejected, (state, action) => {
            state.error = action.error.message || null

            state.isLoading = false
        })
        // refresh Token
        .addCase(refreshToken.pending, (state) => {
            state.error = null
            
            state.isLoading = true
        })
        .addCase(refreshToken.fulfilled, (state, action) => {
            console.log("refreshed token")
            if (state.user) {
                state.user.expiresAt = action.payload.expiresAt
            }

            state.isLoading = false
        })
        .addCase(refreshToken.rejected, (state, action) => {
            state.error = action.error.message || null

            state.isLoading = false
        })
        .addCase(logout.pending, (state) => {
            state.isLoading = true
        })
        .addCase(logout.fulfilled, (state) => {
            state.user = null;
            localStorage.removeItem('user')
            state.isLoading = false
        })
        .addCase(logout.rejected, (state) => {
            state.user = null;
            localStorage.removeItem('user')
            state.isLoading = false
        })
        .addCase(register.pending, (state) => {
            state.isLoading = true
        })
        .addCase(register.fulfilled, (state) => {
            state.isLoading = false
            state.registered = true
        })
        .addCase(register.rejected, (state) => {
            state.isLoading = false
        })
    }
})

// create slice

// const name = 'auth';
// const initialState = createInitialState();
// const reducers = createReducers();
// const extraActions = createExtraActions();
// const extraReducers = createExtraReducers();
// const slice = createSlice({ name, initialState, reducers, extraReducers });

// // exports

// export const authActions = { ...slice.actions, ...extraActions };
// export const authReducer = slice.reducer;

// // implementation

// function createInitialState(): AuthState {
//     const userJson = localStorage.getItem('user');

//     return {
//         // initialize state from local storage to enable user to stay logged in
//         user: userJson ? JSON.parse(userJson) : null,
//         error: null
//     }
// }

// function createReducers() {
//     return {
//         logout
//     };

//     function logout(state: AuthState) {
//         state.user = null;
//         localStorage.removeItem('user');
//         history.navigate('/login');
//     }
// }

// function createExtraActions() {
//     return {
//         login: login()
//     };    

//     function login() {
//         return createAsyncThunk(
//             `${name}/login`,
//             async (user: { username: string, password: string }) => await Api.authenticate(user)
//         );
//     }
// }

// function createExtraReducers() {
//     return {
//         ...login()
//     };

//     function login() {
//         var { pending, fulfilled, rejected } = extraActions.login;

//         if (typeof pending !== 'string' || typeof fulfilled !== 'string' || typeof rejected !== 'string') {
//             throw new Error('Action types must be strings');
//         }

//         return {
//             [pending]: (state: AuthState) => {
//                 state.error = null;
//             },
//             [fulfilled]: (state: AuthState, action) => {
//                 const user = action.payload;
                
//                 // store user details and jwt token in local storage to keep user logged in between page refreshes
//                 localStorage.setItem('user', JSON.stringify(user));
//                 state.user = user;

//                 // get return url from location state or default to home page
//                 const { from } = history.location.state || { from: { pathname: '/' } };
//                 history.navigate(from);
//             },
//             [rejected]: (state: AuthState, action) => {
//                 state.error = action.error;
//             }
//         };
//     }
// }
