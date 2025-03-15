import { useAppSelector } from "@/app/hooks"
import { selectUserById } from "../users/usersSlice"

interface PostAuthorProps{
    userId: string,
    showPrefix?: boolean
}

export const PostAuthor = ({userId, showPrefix = true}: PostAuthorProps) => {
    const author = useAppSelector(state => selectUserById(state, userId))

    return(
        <span>
            by {showPrefix ? "by " : ""}
            by {author?.name ?? "Unkown author"}
        </span>
    ) 
        
}