import * as $ from 'svelte/internal/server';
import { sortedBlogPosts, blogInfo } from "./posts";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('8fdu19', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(blogInfo.name)}</title>`);
			});

			$$renderer.push(`<meta name="description" content="Our blog posts."/>`);
		});

		$$renderer.push(`<div class="py-8 lg:py-12 px-6 max-w-lg mx-auto"><div class="text-3xl lg:text-5xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"><div class="text-center leading-relaxed font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">${$.escape(blogInfo.name)}</div> <a href="/blog/rss.xml" target="_blank" rel="noreferrer"><img class="flex-none w-5 h-5 object-contain" src="/images/rss.svg" alt="rss feed"/></a></div> <div class="text-lg text-center">A demo blog with sample content.</div> <!--[-->`);

		const each_array = $.ensure_array_like(sortedBlogPosts);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let post = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', post.link)}><div class="card my-6 bg-white shadow-xl flex-row overflow-hidden"><div class="flex-none w-6 md:w-32 bg-secondary"></div> <div class="py-6 px-6"><div class="text-xl">${$.escape(post.title)}</div> <div class="text-sm text-accent">${$.escape(post.parsedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}</div> <div class="text-slate-500">${$.escape(post.description)}</div></div></div></a>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}