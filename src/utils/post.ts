import { getCollection } from 'astro:content'
import type { CollectionEntry, ContentCollectionKey } from 'astro:content'

/**
 * Retrieves filtered posts from the specified content collection.
 * In production, it filters out draft posts.
 *
 * @async
 * @param {ContentCollectionKey} contentCollectionType
 *  The type of the content collection to filter.
 * @returns {Promise<CollectionEntry<ContentCollectionKey>[]>}
 *  A promise that resolves to the filtered posts.
 */
export async function getFilteredPosts(
  contentCollectionType: ContentCollectionKey
): Promise<CollectionEntry<ContentCollectionKey>[]> {
  return await getCollection(contentCollectionType, ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true
  })
}

/**
 * Sorts an array of posts by their publication date in descending order.
 *
 * @param {CollectionEntry<ContentCollectionKey>[]} posts - An array of posts to sort.
 * @returns {CollectionEntry<ContentCollectionKey>[]} - The sorted array of posts.
 */
export function getSortedPosts(
  posts: CollectionEntry<ContentCollectionKey>[]
): CollectionEntry<ContentCollectionKey>[] {
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )
}

/**
 * Extracts the sequence number from a slug (e.g., "langchain/1基本介绍" -> 1)
 *
 * @param {string} slug - The slug to extract number from.
 * @returns {number} - The extracted number, or Infinity if no number found.
 */
function extractSequenceNumber(slug: string): number {
  // Extract the filename part from the slug (after the last '/')
  const parts = slug.split('/')
  const filename = parts[parts.length - 1]

  // Match numbers at the beginning of the filename, with or without dot separator
  const match = filename.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : Infinity
}

/**
 * Sorts an array of blog posts by category first, then by filename sequence number within each category.
 *
 * @param {CollectionEntry<ContentCollectionKey>[]} posts - An array of posts to sort.
 * @returns {CollectionEntry<ContentCollectionKey>[]} - The sorted array of posts.
 */
export function getSortedPostsByCategory(
  posts: CollectionEntry<ContentCollectionKey>[]
): CollectionEntry<ContentCollectionKey>[] {
  return posts.sort((a, b) => {
    const categoryA = ('category' in a.data ? a.data.category : undefined) || '未分类'
    const categoryB = ('category' in b.data ? b.data.category : undefined) || '未分类'

    // First sort by category
    const categoryCompare = categoryA.localeCompare(categoryB, 'zh-CN')
    if (categoryCompare !== 0) {
      return categoryCompare
    }

    // Then sort by sequence number within the same category
    const seqA = extractSequenceNumber(a.slug)
    const seqB = extractSequenceNumber(b.slug)

    if (seqA !== seqB) {
      return seqA - seqB // Sort by sequence number (ascending)
    }

    // If no sequence numbers or they're equal, sort by publication date (newest first)
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  })
}

/**
 * Checks if two posts belong to the same category.
 *
 * @param {string} category1 - The category of the first post.
 * @param {string} category2 - The category of the second post.
 * @returns {boolean} - True if both posts belong to the same category.
 */
export function isSameCategory(category1?: string, category2?: string): boolean {
  return category1 === category2
}

/**
 * Gets unique categories from an array of posts and sorts them alphabetically.
 *
 * @param {CollectionEntry<ContentCollectionKey>[]} posts - An array of posts.
 * @returns {string[]} - An array of unique categories sorted alphabetically.
 */
export function getUniqueCategories(
  posts: CollectionEntry<ContentCollectionKey>[]
): string[] {
  const categoriesSet = new Set<string>()

  posts.forEach((post) => {
    const category = ('category' in post.data ? post.data.category : undefined) || '未分类'
    categoriesSet.add(category)
  })

  return Array.from(categoriesSet).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}
