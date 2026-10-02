import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const posts = $.derived(() => page.data.blogs);

		function formatDate(dateString) {
			return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		}

		SeoHeader($$renderer, { metaTitle: 'Blog | Insights & News' });
		$$renderer.push(`<!----> <div class="mx-auto max-w-4xl px-4 py-8"><h1 class="mb-8 text-center text-4xl font-bold text-gray-900">Blog</h1> `);

		if (posts()?.data?.length) {
			$$renderer.push(`<!--[0--><div class="grid gap-8 md:grid-cols-2"><!--[-->`);

			const each_array = $.ensure_array_like(posts().data);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let post = each_array[$$index_1];

				$$renderer.push(`<article class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">`);

				if (post.imageUrl || post.thumbnail) {
					$$renderer.push(`<!--[0--><a${$.attr('href', `/blog/${post.slug || post.id}`)}><img${$.attr('src', post.imageUrl || post.thumbnail)}${$.attr('alt', post.title)} class="h-48 w-full object-cover"/></a>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="p-6"><div class="mb-3 flex items-center gap-2 text-sm text-gray-600">`);

				if (post.author) {
					$$renderer.push(`<!--[0--><span>${$.escape(post.author)}</span> <span>•</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <time${$.attr('datetime', post.createdAt)}>${$.escape(formatDate(post.createdAt))}</time></div> <h2 class="mb-2 text-xl font-semibold text-gray-900"><a${$.attr('href', `/blog/${post.slug || post.id}`)} class="transition-colors hover:text-blue-600">${$.escape(post.title)}</a></h2> `);

				if (post.excerpt) {
					$$renderer.push(`<!--[0--><p class="mb-4 text-gray-600">${$.escape(post.excerpt)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (post.tags?.length) {
					$$renderer.push(`<!--[0--><div class="flex gap-2"><!--[-->`);

					const each_array_1 = $.ensure_array_like(post.tags);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let tag = each_array_1[$$index];

						$$renderer.push(`<span class="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-600">${$.escape(tag)}</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></article>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="py-8 text-center text-gray-500"><p>No blog posts available at the moment.</p></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}