import { RootState } from "@/app/store"
import { createAsyncThunk, createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit"
import { client } from "@/api/client"
import { createAppAsyncThunk } from "@/app/withTypes"
import { logout } from "../auth/authSlice"


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

const initialReactions: Reactions = {
    thumbsUp: 0,
    tada: 0,
    heart: 0,
    rocket: 0,
    eyes: 0
}

interface PostsState{
    posts: Post[],
    status: 'idle' | 'pending' | 'succeed' | 'failed'
    error: string | null
}

const initialState: PostsState = {
    posts: [],
    status: 'idle',
    error: null
}

type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>
type NewPost = Pick<Post, 'title' | 'content' | 'user' >

export const fetchPosts = createAppAsyncThunk('posts/fetchPosts', 
    async () => {
        const response = await client.get<Post[]>('/fakeApi/posts')
        return response.data
    },
    {
        condition(arg, thunkApi){
            const postsStatus = selectPostsStatus(thunkApi.getState())
            if(postsStatus !== 'idle'){
                return false
            }
        }
    }

)

export const addNewPost = createAppAsyncThunk(
    'posts/addNewPost',
    // The payload creator receives the partial `{title, content, user}` object
    async (initialPost: NewPost) => {
        const response = await client.post<Post>('/fakeApi/posts', initialPost)
        // The response includes the complete post object, including unique ID
        return response.data
    }
)

// Create the slice and pass in the initial state
const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
    
        postUpdated(state, action: PayloadAction<PostUpdate>) {
            const { id, title, content } = action.payload
            const existingPost = state.posts.find(post => post.id === id)
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
            const existingPost = state.posts.find(post => post.id === postId)
            if (existingPost) {
                existingPost.reactions[reaction]++
            }
        }
    },
    extraReducers: (builder) => {
        // Pass the action creator to `builder.addCase()`
        builder
        .addCase(logout.fulfilled, (state) => {
            // Clear out the list of posts whenever the user logs out
            return initialState
        })
        .addCase(fetchPosts.pending, (state, action) => {
            state.status = 'pending'
        })
        .addCase(fetchPosts.fulfilled, (state, action) => {
            state.status = 'succeed'
            state.posts.push(...action.payload)
        })
        .addCase(fetchPosts.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.error.message ?? 'Unknown Error'
        })
        .addCase(addNewPost.fulfilled, (state, action) => {
            state.posts.push(action.payload)
        })
    
    }
})

// Export the auto-generated action creator with the same name
export const { postUpdated, reactionAdded } = postSlice.actions

// Export the generated reducer function
export default postSlice.reducer

export const selectAllPosts = (state: RootState) => state.posts.posts

export const selectedById = (state: RootState, postId: string) => state.posts.posts.find(post => post.id === postId)

export const selectPostsByUser = (state: RootState, userId: string) => {
    const allPosts = selectAllPosts(state)
    return allPosts.filter(post => post.user === userId)
}

export const selectPostsStatus = (state: RootState) => state.posts.status
export const selectPostsError = (state: RootState) => state.posts.error