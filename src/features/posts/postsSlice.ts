import { RootState } from "@/app/store"
import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit"
import { sub } from "date-fns"
import { userLoggedOut } from '@/features/auth/authSlice'


// Define a TS type for the data we'll be using
export interface Reactions {
    thumbsUp: number,
    tada: number,
    heart: number,
    rocket: number,
    eyes: number
}

export type ReactionName = keyof Reactions

export interface Post {
    id: string,
    title: string,
    content: string,
    date: string,
    user: string,
    reactions: Reactions
}

type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>

const initialReactions: Reactions = {
    thumbsUp: 0,
    tada: 0,
    heart: 0,
    rocket: 0,
    eyes: 0
}

// Create an initial state value for the reducer, with that type
const initialState: Post[] = [
    {
        id: '1',
        title: 'First Post!',
        content: 'Hello!',
        date: sub(new Date, { minutes: 10 }).toISOString(),
        user: '0',
        reactions: initialReactions
    },
    {
        id: '2',
        title: 'Second Post',
        content: 'More text',
        date: sub(new Date(), { minutes: 5 }).toISOString(),
        user: '1',
        reactions: initialReactions

    }
]

// Create the slice and pass in the initial state
const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        // Declare a "case reducer" named `postAdded`.
        // The type of `action.payload` will be a `Post` object.
        postAdded: {
            // "Mutate" the existing state array, which is
            // safe to do here because `createSlice` uses Immer inside.
            reducer(state, action: PayloadAction<Post>) {
                state.push(action.payload)
            },
            prepare(title: string, content: string, userId: string) {
                return {
                    payload: {
                        id: nanoid(),
                        date: new Date().toISOString(),
                        title,
                        content,
                        user: userId,
                        reactions: initialReactions
                    }
                }
            },
        },

        postUpdated(state, action: PayloadAction<PostUpdate>) {
            const { id, title, content } = action.payload
            const existingPost = state.find(post => post.id === id)
            if (existingPost) {
                existingPost.title = title
                existingPost.content = content
            }
        },

        reactionAdded(
            state,
            action: PayloadAction<{ postId: string, reaction: ReactionName }>
        ) {
            const { postId, reaction } = action.payload
            const existingPost = state.find(post => post.id === postId)
            if (existingPost) {
                existingPost.reactions[reaction]++
            }
        }
    },
    extraReducers: (builder) => {
        // Pass the action creator to `builder.addCase()`
        builder.addCase(userLoggedOut, (state) => {
            // Clear out the list of posts whenever the user logs out
            return []
        })
    }
})

// Export the auto-generated action creator with the same name
export const { postAdded, postUpdated, reactionAdded } = postSlice.actions

// Export the generated reducer function
export default postSlice.reducer

export const selectAllPosts = (state: RootState) => state.posts

export const selectedById = (state: RootState, postId: string) => state.posts.find(post => post.id === postId)