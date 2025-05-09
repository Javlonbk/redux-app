import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Post, NewPost, PostUpdate, ReactionName } from "../posts/postsSlice";
import { User } from '../users/usersSlice'

export type { Post }



// Define our single API slice object
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: `/fakeApi` }),
    tagTypes: ['Post'],
    endpoints: builder => ({
        getPosts: builder.query<Post[], void>({
            query: () => '/posts',
            providesTags: (result = [], error, arg) => [
                'Post',
                ...result.map(({ id }) => ({ type: 'Post' as const, id })),
            ],

        }),
        getPost: builder.query<Post, string>({
            query: postId => `/posts/${postId}`,
            providesTags: (result, error, arg) => [{ type: 'Post', id: arg }]
        }),
        addNewPost: builder.mutation<Post, NewPost>({
            query: initialPost => ({
                url: '/posts',
                method: 'POST',
                body: initialPost
            }),
            invalidatesTags: ['Post']
        }),
        editPost: builder.mutation<Post, PostUpdate>({
            query: post => ({
                url: `/posts/${post.id}`,
                method: "PATCH",
                body: post
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.id }]
        }),
        addReaction: builder.mutation<
            Post,
            { postId: string; reaction: ReactionName }
        >({
            query: ({ postId, reaction }) => ({
                url: `posts/${postId}/reactions`,
                method: 'POST',
                // In a real app, we'd probably need to base this on user ID somehow
                // so that a user can't do the same reaction more than once
                body: { reaction }
            }),
            // since we're now doing optimistic updates
            async onQueryStarted({ postId, reaction }, lifecycleApi) {
                // `updateQueryData` requires the endpoint name and cache key arguments,
                // so it knows which piece of cache state to update
                const getPostsPatchResult = lifecycleApi.dispatch(
                    apiSlice.util.updateQueryData('getPosts', undefined, draft => {
                        // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
                        const post = draft.find(post => post.id === postId)
                        if (post) {
                            post.reactions[reaction]++
                        }
                    })
                )
                // We also have another copy of the same data in the `getPost` cache
                // entry for this post ID, so we need to update that as well
                const getPostPatchResult = lifecycleApi.dispatch(
                    apiSlice.util.updateQueryData('getPost', postId, draft => {
                        draft.reactions[reaction]++
                    })
                )

                try {
                    await lifecycleApi.queryFulfilled
                } catch {
                    getPostsPatchResult.undo()
                    getPostPatchResult.undo()
                }
            },

        }),

    })
})


export const {
    useGetPostsQuery,
    useGetPostQuery,
    useAddNewPostMutation,
    useAddReactionMutation,
    useEditPostMutation
} = apiSlice