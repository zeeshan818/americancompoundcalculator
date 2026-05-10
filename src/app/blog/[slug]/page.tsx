import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allPosts, getPostBySlug, getAllSlugs } from '@/content/blog'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: `https://americancompoundcalculator.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: 'article',
      url: `https://americancompoundcalculator.com/blog/${post.slug}`,
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  // Find prev/next for navigation
  const currentIndex = allPosts.findIndex((p) => p.slug === params.slug)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(post.schema) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#1e3a5f] dark:hover:text-blue-300 transition-colors">
          Home
        </Link>
        <span className="mx-2">›</span>
        <Link href="/blog" className="hover:text-[#1e3a5f] dark:hover:text-blue-300 transition-colors">
          Blog
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700 dark:text-gray-300">{post.title}</span>
      </nav>

      {/* Article Header */}
      <article>
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e3a5f] dark:text-blue-200 leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-4">
            <span>By <strong className="text-gray-700 dark:text-gray-300">the Editorial Team</strong></span>
            <span>·</span>
            <time dateTime={post.date}>{post.date}</time>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* AdSense mid-article slot — injected between article sections via wrapper */}
        {/* Article Content — split for ad injection */}
        <div
          className="
            prose prose-slate dark:prose-invert max-w-none
            prose-headings:text-[#1e3a5f] dark:prose-headings:text-blue-200
            prose-a:text-[#1e3a5f] dark:prose-a:text-blue-400
            prose-strong:text-gray-800 dark:prose-strong:text-gray-200
            prose-ul:leading-relaxed prose-li:leading-relaxed
            prose-table:text-sm
            text-gray-700 dark:text-gray-300 leading-relaxed
            article-body
          "
          dangerouslySetInnerHTML={{ __html: injectAdSlot(post.content) }}
        />
      </article>

      {/* CTA */}
      <div className="mt-10 bg-[#1e3a5f] text-white rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="font-bold text-lg mb-1">Try the Calculator</p>
          <p className="text-blue-200 text-sm">See these numbers with your own principal, rate, and timeline.</p>
        </div>
        <Link
          href="/"
          className="shrink-0 bg-white text-[#1e3a5f] font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm text-center"
        >
          Open the Calculator →
        </Link>
      </div>

      {/* Prev/Next navigation */}
      {(prevPost || nextPost) && (
        <nav className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between" aria-label="Article navigation">
          {prevPost && (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#1e3a5f] dark:hover:border-blue-500 transition-all"
            >
              <p className="text-xs text-gray-400 mb-1">← Previous</p>
              <p className="text-sm font-semibold text-[#1e3a5f] dark:text-blue-300 group-hover:underline line-clamp-2">
                {prevPost.title}
              </p>
            </Link>
          )}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-right hover:border-[#1e3a5f] dark:hover:border-blue-500 transition-all"
            >
              <p className="text-xs text-gray-400 mb-1">Next →</p>
              <p className="text-sm font-semibold text-[#1e3a5f] dark:text-blue-300 group-hover:underline line-clamp-2">
                {nextPost.title}
              </p>
            </Link>
          )}
        </nav>
      )}

      {/* Back to blog */}
      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#1e3a5f] dark:hover:text-blue-300 transition-colors"
        >
          ← All Articles
        </Link>
      </div>
    </main>
  )
}

/**
 * Injects the AdSense mid-article slot div between paragraphs 3 and 4.
 * Finds the 3rd closing </p> tag and inserts the ad div after it.
 */
function injectAdSlot(html: string): string {
  const marker = '</p>'
  let count = 0
  let insertAt = -1

  for (let i = 0; i < html.length; i++) {
    if (html.slice(i, i + marker.length) === marker) {
      count++
      if (count === 3) {
        insertAt = i + marker.length
        break
      }
    }
  }

  if (insertAt === -1) return html

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const adSlot = client
    ? `\n<div class="ad-slot-wrapper my-4 w-full overflow-hidden text-center"><ins class="adsbygoogle" style="display:block" data-ad-client="${client}" data-ad-slot="3333333333" data-ad-format="auto" data-full-width-responsive="true"></ins></div>\n`
    : ``
  return html.slice(0, insertAt) + adSlot + html.slice(insertAt)
}
