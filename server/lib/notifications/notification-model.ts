import sql from 'sql-template-strings'
import { NotificationType } from '../../../common/notifications'
import { SbUserId } from '../../../common/users/user-info'
import db from '../db/index'
import { Dbify } from '../db/types'

export interface BaseNotificationData {
  readonly type: NotificationType
}

export interface PartyInviteNotificationData extends BaseNotificationData {
  type: typeof NotificationType.PartyInvite
  from: string
  partyId: string
}

export interface PartyInviteSearchNotificationData extends BaseNotificationData {
  type: typeof NotificationType.PartyInvite
  from?: string
  partyId?: string
}

export type NotificationData = PartyInviteNotificationData
/**
 * Notification data type that can be used to retrieve notifications by. Should match the actual
 * notification data, except making some (all?) of the fields optional.
 */
export type SearchNotificationData = PartyInviteSearchNotificationData | Record<string, never>

export interface Notification {
  id: string
  userId: SbUserId
  read: boolean
  visible: boolean
  createdAt: Date
  data: NotificationData
}

type DbNotification = Dbify<Notification>

function fromDbNotification(result: Readonly<DbNotification>): Notification {
  return {
    id: result.id,
    userId: result.user_id,
    read: result.read,
    visible: result.visible,
    createdAt: result.created_at,
    data: result.data,
  }
}

/**
 * Retrieves the list of 100 visible notifications for a particular user by default, ordered by the
 * time they were created. Additionally, the notifications can be filtered by any of their data
 * properties.
 */
export async function retrieveNotifications({
  userId,
  data = {},
  visible = true,
  limit = 100,
}: {
  userId: SbUserId
  data?: SearchNotificationData
  visible?: boolean
  limit?: number
}): Promise<Notification[]> {
  const { client, done } = await db()
  try {
    const query = sql`
      SELECT id, user_id, read, visible, created_at, data
      FROM notifications
      WHERE user_id = ${userId} AND visible = ${visible}
    `

    for (const [dataKey, dataValue] of Object.entries(data)) {
      query.append(sql` AND data->>${dataKey} = ${dataValue}`)
    }

    query.append(sql`
      ORDER BY created_at DESC
      LIMIT ${limit};
    `)

    const result = await client.query<DbNotification>(query)
    return result.rows.map(n => fromDbNotification(n))
  } finally {
    done()
  }
}

/**
 * Creates a new notification with the given data and persists it to the DB. Notifications are
 * created as unread, but visible by default.
 */
export async function addNotification({
  userId,
  data,
  createdAt = new Date(),
}: {
  userId: SbUserId
  data: NotificationData
  createdAt?: Date
}): Promise<Notification> {
  const { client, done } = await db()
  try {
    const result = await client.query<DbNotification>(sql`
      INSERT INTO notifications (user_id, created_at, data)
      VALUES (${userId}, ${createdAt}, ${data})
      RETURNING *;
    `)

    return fromDbNotification(result.rows[0])
  } finally {
    done()
  }
}

/**
 * Marks the given notification(s) for a particular user as read.
 */
export async function markRead(
  userId: SbUserId,
  notificationIds: ReadonlyArray<string>,
): Promise<void> {
  const { client, done } = await db()
  try {
    await client.query(sql`
      UPDATE notifications
      SET read = true
      WHERE user_id = ${userId} AND id = ANY(${notificationIds});
    `)
  } finally {
    done()
  }
}

/**
 * Marks all notifications before a given date for a particular user as not visible, i.e. cleared.
 */
export async function clearBefore(userId: SbUserId, date: Date): Promise<void> {
  const { client, done } = await db()
  try {
    await client.query(sql`
      UPDATE notifications
      SET visible = false
      WHERE user_id = ${userId} AND created_at <= ${date};
    `)
  } finally {
    done()
  }
}

/**
 * Marks the given notification for a particular user as not visible, i.e. cleared.
 */
export async function clearById(userId: SbUserId, notificationId: string): Promise<void> {
  const { client, done } = await db()
  try {
    await client.query(sql`
      UPDATE notifications
      SET visible = false
      WHERE user_id = ${userId} AND id = ${notificationId};
    `)
  } finally {
    done()
  }
}
