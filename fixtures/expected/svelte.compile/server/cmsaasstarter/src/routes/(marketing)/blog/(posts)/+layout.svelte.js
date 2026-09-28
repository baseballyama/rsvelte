import * as $ from 'svelte/internal/server';
import { page } from "$app/stores";
import { error } from "@sveltejs/kit";
import { sortedBlogPosts } from "./../posts";
import { WebsiteName } from "../../../../config";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		function getCurrentPost(url) {
			let searchPost = null;

			for (const post of sortedBlogPosts) {
				if (url == post.link || url == post.link + "/") {
					searchPost = post;

					continue;
				}
			}

			if (!searchPost) {
				error(404, "Blog post not found");
			}

			return searchPost;
		}

		let currentPost = $.derived(() => getCurrentPost($.store_get($$store_subs ??= {}, '$page', page).url.pathname));

		function buildLdJson(post) {
			return {
				"@context": "https://schema.org",
				"@type": "BlogPosting",
				headline: post.title,
				datePublished: post.parsedDate?.toISOString(),
				dateModified: post.parsedDate?.toISOString()
			};
		}

		let jsonldScript = $.derived(() => `<script type="application/ld+json">${JSON.stringify(buildLdJson(currentPost())) + "<"}/script>`);
		let pageUrl = $.derived(() => $.store_get($$store_subs ??= {}, '$page', page).url.origin + $.store_get($$store_subs ??= {}, '$page', page).url.pathname);

		$.head('1lsl30p', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(currentPost().title)}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', currentPost().description)}/> <meta property="og:title"${$.attr('content', currentPost().title)}/> <meta property="og:description"${$.attr('content', currentPost().description)}/> <meta property="og:site_name"${$.attr('content', WebsiteName)}/> <meta property="og:url"${$.attr('content', pageUrl())}/>  <meta name="twitter:card" content="summary"/> <meta name="twitter:title"${$.attr('content', currentPost().title)}/> <meta name="twitter:description"${$.attr('content', currentPost().description)}/>  ${$.html(jsonldScript())}`);
		});

		$$renderer.push(`<article class="prose mx-auto py-12 px-6 font-sans"><div class="text-sm text-accent">${$.escape(currentPost().parsedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))}</div> <h1>${$.escape(currentPost().title)}</h1> `);
		children?.($$renderer);
		$$renderer.push(`<!----></article>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}