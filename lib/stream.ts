/**
 * @deprecated Use '@/lib/stream-server' directly.
 * This file exists for backward compatibility only.
 */
export { getStreamServerClient, createProjectChannel } from './stream-server'

// Re-export createProjectChannel with the old signature for backward compat
import { createProjectChannel as _createProjectChannel } from './stream-server'

/**
 * Legacy wrapper — old call: createProjectChannel(projectId, memberIds, projectTitle)
 * New call uses an object param. This adapter handles both.
 */
export async function createProjectChannelLegacy(
  projectId: string,
  memberIds: string[],
  projectTitle: string
) {
  return _createProjectChannel({
    projectId,
    projectName: projectTitle,
    founderId: memberIds[0],
    memberIds: memberIds.slice(1),
  })
}
