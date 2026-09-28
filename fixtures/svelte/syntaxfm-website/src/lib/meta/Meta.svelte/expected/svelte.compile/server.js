import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import { PUBLIC_URL } from '$env/static/public';

export default function Meta($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let title = `Syntax - Web Development Podcast`;

		let meta = $.derived(() => ({
			//·defaults
			description: `Full Stack Web Developers Wes Bos and Scott Tolinski dive deep into web development, CSS, JavaScript, Frameworks, Typescript, Servers and more. Listen in 2 times a week!`,
			image: `${$.store_get($$store_subs ??= {}, '$page', page).url.protocol}//${$.store_get($$store_subs ??= {}, '$page', page).url.host}/og/${encodeURIComponent($.store_get($$store_subs ??= {}, '$page', page).data.meta?.title || title)}.jpg`,
			title,
			// any page customizations
			...$.store_get($$store_subs ??= {}, '$page', page).data.meta
		}));

		function generateTitle(title) {
			if (title.toLowerCase().includes('syntax')) return title;

			return `${title} - Syntax`;
		}

		$.head('6ijh7a', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(generateTitle(meta().title))}</title>`);
			});

			$$renderer.push(`<link rel="alternate" type="application/rss+xml" href="https://feed.syntax.fm" title="Syntax RSS Feed"/> <meta name="image" property="og:image"${$.attr('content', meta().image)}/> <meta name="theme-color" content="#000000"/> `);

			if (meta().canonical) {
				$$renderer.push(`<!--[0--><link rel="canonical"${$.attr('href', meta().canonical)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <meta property="og:type" content="website"/> <meta property="og:title"${$.attr('content', generateTitle(meta().title))}/> <meta property="og:description"${$.attr('content', meta().description)}/> `);

			if (meta().canonical) {
				$$renderer.push(`<!--[0--><meta property="og:url"${$.attr('content', meta().canonical)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <meta name="description"${$.attr('content', meta().description)}/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:title"${$.attr('content', generateTitle(meta().title))}/> <meta name="twitter:site" content="@syntaxfm"/> <meta name="twitter:description"${$.attr('content', meta().description)}/> <meta name="twitter:image"${$.attr('content', meta().image)}/>`);
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}