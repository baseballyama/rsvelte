import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import StructuredData from '$lib/components/seo/structured-data.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const blog = $.derived(() => page.data.blog);
		const store = $.derived(() => page.data.store);

		function formatDate(dateString) {
			return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		}

		// Meta description: prefer explicit meta/excerpt if the API provides them,
		// otherwise strip HTML from the post content and trim to a sane length.
		const metaDescription = $.derived(() => (blog()?.metaDescription || blog()?.excerpt || (blog()?.content ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 160).trim());

		const blogImage = $.derived(() => blog()?.banner || blog()?.imageUrl || blog()?.thumbnail || '');

		// BlogPosting/Article structured data — only include fields that actually exist, and mirror
		// what the page visibly renders (byline author, published-at date) so the markup cannot
		// disagree with the content.
		const publishedAt = $.derived(() => blog()?.publishedAt || blog()?.createdAt);

		const articleJsonLd = $.derived(() => ({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: blog()?.title,
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': page.url.origin + page.url.pathname
			},
			...metaDescription() ? { description: metaDescription() } : {},
			...blogImage() ? { image: [blogImage()] } : {},
			...publishedAt() ? { datePublished: publishedAt() } : {},
			...blog()?.updatedAt ? { dateModified: blog().updatedAt } : {},
			author: blog()?.author
				? { '@type': 'Person', name: blog().author }
				: { '@type': 'Organization', name: store()?.name },

			publisher: {
				'@type': 'Organization',
				name: store()?.name,
				...store()?.logo
					? { logo: { '@type': 'ImageObject', url: store().logo } }
					: {}
			}
		}));

		SeoHeader($$renderer, {
			metaTitle: blog()?.metaTitle || blog()?.title || 'Blog',
			metaDescription: metaDescription(),
			image: blogImage()
		});

		$$renderer.push(`<!----> `);
		StructuredData($$renderer, { schema: articleJsonLd() });
		$$renderer.push(`<!----> <div class="mx-auto max-w-4xl px-4 py-8">`);

		if (blog()) {
			$$renderer.push(`<!--[0--><article class="prose prose-lg max-w-none">`);

			if (blogImage()) {
				$$renderer.push(`<!--[0--><img${$.attr('src', blogImage())}${$.attr('alt', blog().title)} class="mb-8 h-64 w-full rounded-lg object-cover"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <header class="mb-8"><h1 class="mb-4 text-4xl font-bold text-gray-900">${$.escape(blog().title)}</h1> <div class="flex items-center gap-4 text-gray-600">`);

			if (blog().author) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2"><span class="font-medium">${$.escape(blog().author)}</span></div> <span>•</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (blog().publishedAt || blog().createdAt) {
				$$renderer.push(`<!--[0--><time${$.attr('datetime', blog().publishedAt || blog().createdAt)}>${$.escape(formatDate(blog().publishedAt || blog().createdAt))}</time>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></header> `);

			if (blog().tags?.length) {
				$$renderer.push(`<!--[0--><div class="mb-8"><!--[-->`);

				const each_array = $.ensure_array_like(blog().tags);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let tag = each_array[$$index];

					$$renderer.push(`<span class="mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">${$.escape(tag)}</span>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="prose prose-lg prose-gray prose-p:my-0 prose-li:my-0">${$.html(blog().content)}</div></article> <div class="mt-12 border-t pt-8"><a href="/blog" class="inline-flex items-center text-blue-600 transition-colors hover:text-blue-800">← Back to Blog</a></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="py-8 text-center text-gray-500"><p>Blog post not found.</p> <a href="/blog" class="mt-4 inline-block text-blue-600 transition-colors hover:text-blue-800">← Back to Blog</a></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}