import { Action, configureStore } from "@reduxjs/toolkit"
import postsReducer from '../features/posts/postsSlice'
import userReducer from '../features/users/usersSlice'
import autReducer from '../features/auth/authSlice'


export const store = configureStore({
    reducer: {
        auth: autReducer,
        posts: postsReducer,
        users: userReducer
    }
})

// Infer the type of 'store'
export type AppStore  = typeof store
// Infer the 'AppDispatch' type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for 'RootState' type
export type RootState = ReturnType<typeof store.getState>