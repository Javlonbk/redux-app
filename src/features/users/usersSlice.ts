import { RootState } from "@/app/store"
import { createSlice } from "@reduxjs/toolkit"
import { selectCurrentUsername } from "../auth/authSlice"


interface User {
    id: string,
    name: string
}

const initialState: User[] = [
    { id: '0', name: 'Ozodbek' },
    { id: '1', name: 'SaidAhmad' },
    { id: '2', name: 'Jonibek' }
]

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {

    }
})

export default usersSlice.reducer

export const selectAllUsers = (state: RootState) => state.users

export const selectUserById = (state: RootState, userId: string | null) =>
    state.users.find(user => user.id === userId)

export const selectCurrentUser = (state: RootState) => {
    const currentUsername = selectCurrentUsername(state)
    return selectUserById(state, currentUsername)
  }