import { algoliasearch } from 'algoliasearch'

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
const adminKey = process.env.ALGOLIA_ADMIN_KEY!

export const searchClient = algoliasearch(appId, searchKey)
export const adminClient = algoliasearch(appId, adminKey)

export const PROJECTS_INDEX = 'ibf_projects'
export const PROFILES_INDEX = 'ibf_profiles'

export interface AlgoliaProject {
  objectID: string
  title: string
  tagline: string
  description: string
  stage: string
  category: string
  cover_image_url: string | null
  founder_name: string
  founder_avatar: string | null
  skills_required: string[]
  compensation_types: string[]
  commitment_types: string[]
  open_roles_count: number
  created_at: string
}

export async function syncProjectToAlgolia(project: AlgoliaProject) {
  // In v5, we use saveObject directly on the client and pass the indexName
  await adminClient.saveObject({
    indexName: PROJECTS_INDEX,
    body: project
  })
}

export async function deleteProjectFromAlgolia(projectId: string) {
  await adminClient.deleteObject({
    indexName: PROJECTS_INDEX,
    objectID: projectId
  })
}
