import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { allNotificationsRead, selectMetadataEntities, useGetNotificationsQuery } from "./notificationSlice"
import { useLayoutEffect } from "react"
import classNames from "classnames"
import { PostAuthor } from "../posts/PostAuthor"
import { TimeAgo } from "@/components/TimeAgo"


export const NotificationsList = () => {
  const dispatch = useAppDispatch()
  const { data: notifications = [] } = useGetNotificationsQuery()
  const notificationsMetadata: Record<string, { isNew: boolean }> = useAppSelector(selectMetadataEntities)

  useLayoutEffect(() => {
    dispatch(allNotificationsRead())
  })

  const renderedNotifications = notifications.map((notification) => {
    const metadata = notificationsMetadata[notification.id]
    const notificationClassname = classNames('notification', {
      new: metadata.isNew,
    })

    return (
      <div key={notification.id} className={notificationClassname}>
        <div>
          <b>
            <PostAuthor userId={notification.user} showPrefix={false} />
          </b>{' '}
          {notification.message}
        </div>
        <TimeAgo timestamp={notification.date} />
      </div>
    )
  })

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderedNotifications}
    </section>
  )
}
