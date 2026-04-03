export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'team_joined'

export interface NotificationPayload {
  studentName?: string
  roleName?: string
  projectName?: string
  projectId?: string
  applicationId?: string
}

/**
 * Builds a human-readable message from a notification type + payload.
 * Safe to run on the client.
 */
export function buildNotificationMessage(type: NotificationType, payload: NotificationPayload): string {
  switch (type) {
    case 'application_received':
      return `${payload.studentName ?? 'Someone'} applied to your ${payload.roleName ?? 'role'} on ${payload.projectName ?? 'your project'}`
    case 'application_accepted':
      return `Congrats! You've been accepted to ${payload.roleName ?? 'a role'} at ${payload.projectName ?? 'a project'}`
    case 'application_rejected':
      return `Your application to ${payload.roleName ?? 'a role'} at ${payload.projectName ?? 'a project'} was not accepted`
    case 'team_joined':
      return `${payload.studentName ?? 'Someone'} joined your team on ${payload.projectName ?? 'your project'}`
    default:
      return 'You have a new notification'
  }
}

