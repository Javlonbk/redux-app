import { useAppDispatch, useAppSelector } from "@/app/hooks"
import React from "react"
import { postAdded } from "./postsSlice"
import { selectCurrentUsername } from "../auth/authSlice"

// TS types for the input fields
interface AddPostFormFields extends HTMLFormControlsCollection {
    postTitle: HTMLInputElement,
    postContent: HTMLTextAreaElement,
    postAuthor: HTMLOptionElement
}
interface AddPostFormElements extends HTMLFormElement {
    readonly elements: AddPostFormFields
}

export const AddPostForm = () => {

    // Get the `dispatch` method from the store
    const dispatch = useAppDispatch()
    const userId = useAppSelector(selectCurrentUsername) || ''

    const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
        //Prevent server submission
        e.preventDefault()

        const { elements } = e.currentTarget
        const title = elements.postTitle.value
        const content = elements.postContent.value


        dispatch(postAdded(title, content, userId))
        // console.log('Values:', { title, content })
        e.currentTarget.reset()
    }

   

    return (
        <section>
            <h2>Add a New Post</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="postTitle">Post Title:</label>
                <input type="text" id="postTitle" defaultValue="" required />
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="postContent"
                    defaultValue=""
                    required
                />
                <button>Save Post</button>
            </form>
        </section>
    )
}