import { RootState } from "@/app/store"
import { createAsyncThunk, createEntityAdapter, createSlice, EntityState, nanoid, PayloadAction } from "@reduxjs/toolkit"
import { client } from "@/api/client"
import { createAppAsyncThunk } from "@/app/withTypes"
import { logout } from "../auth/authSlice"
import { AppStartListening } from "@/app/listenerMiddleware"


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

interface PostsState extends EntityState<Post, string>{
    posts: Post[],
    status: 'idle' | 'pending' | 'succeed' | 'failed'
    error: string | null
}

const postsAdapter = createEntityAdapter<Post>({
    sortComparer: (a,b) => b.date.localeCompare(a.date)
})

const initialState: PostsState =  postsAdapter.getInitialState({
    posts: [],
    status: 'idle',
    error: null
})

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
            postsAdapter.updateOne(state, { id, changes: { title, content } })
        },

        reactionAdded(
            state,
            action: PayloadAction<{ postId: string, reaction: ReactionName }>
        ) {
            const { postId, reaction } = action.payload
            const existingPost = state.entities[postId]
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
            postsAdapter.setAll(state, action.payload)
        })
        .addCase(fetchPosts.rejected, (state, action) => {
            state.status = 'failed'
            state.error = action.error.message ?? 'Unknown Error'
        })
        .addCase(addNewPost.fulfilled, postsAdapter.addOne)
    }
})

// Export the auto-generated action creator with the same name
export const { postUpdated, reactionAdded } = postSlice.actions

// Export the generated reducer function
export default postSlice.reducer

// Export the customized selectors for this adapter using `getSelectors`
export const {
    selectAll: selectAllPosts,
    selectById: selectPostById,
    selectIds: selectPostIds
    // Pass in a selector that returns the posts slice of state
  } = postsAdapter.getSelectors((state: RootState) => state.posts)
  

export const selectPostsByUser = (state: RootState, userId: string) => {
    const allPosts = selectAllPosts(state)
    return allPosts.filter(post => post.user === userId)
}

export const selectPostsStatus = (state: RootState) => state.posts.status
export const selectPostsError = (state: RootState) => state.posts.error

export const addPostsListeners = (startAppListening: AppStartListening) => {
    startAppListening({
        actionCreator: addNewPost.fulfilled,
        effect: async (action, listenerApi) => {
          const { toast } = await import('react-tiny-toast')
    
          const toastId = toast.show('New post added!', {
            variant: 'success',
            position: 'bottom-right',
            pause: true
          })
    
          await listenerApi.delay(5000)
          toast.remove(toastId)
        }
    })
}