import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import { PUBLIC_MODE } from '$env/static/public';
import ogImageHome from '$lib/assets/images/svelte-put-og.jpg?url';
import { SettingsContext } from '$lib/settings/context.svelte';
import '$lib/styles/app.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children, data } = $$props;
		const DEFAULT_KEYWORDS = ['svelte', 'svelte-put', 'utility'];

		let meta = $.derived(() => {
			const meta = $.store_get($$store_subs ??= {}, '$page', page).data.meta;
			const title = meta?.title ?? 'svelte-put';
			const description = meta?.description ?? 'svelte-put is a collection of utilities, minimal components, and tooling support for projects using Svelte';

			const keywords = meta?.keywords
				? [...DEFAULT_KEYWORDS, ...meta.keywords]
				: DEFAULT_KEYWORDS;

			const canonical = meta?.canonical ?? `${$.store_get($$store_subs ??= {}, '$page', page).url.origin}${$.store_get($$store_subs ??= {}, '$page', page).url.pathname}`;
			const rootRelativeOgImage = meta?.og?.image ?? ogImageHome;

			const og = {
				title: meta?.og?.title ?? title,
				description: meta?.og?.description ?? description,
				type: meta?.og?.type ?? 'website',
				url: meta?.og?.url ?? canonical,
				image: rootRelativeOgImage.startsWith('/')
					? `${$.store_get($$store_subs ??= {}, '$page', page).url.origin}${rootRelativeOgImage}`
					: rootRelativeOgImage,
				imageAlt: meta?.og?.imageAlt ?? title
			};

			const twitter = {
				title: meta?.twitter?.title ?? og.title,
				description: meta?.twitter?.description ?? og.description,
				image: meta?.twitter?.image ?? og.image,
				imageAlt: meta?.twitter?.imageAlt ?? og.imageAlt,
				card: meta?.twitter?.card ?? 'summary_large_image',
				site: meta?.twitter?.site ?? '@vnphanquang',
				creator: meta?.twitter?.creator ?? '@vnphanquang'
			};

			return { title, description, keywords, canonical, og, twitter };
		});

		let settings = SettingsContext.set(data.settings);

		$.head('12evr8a', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(meta().title)}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', meta().description)}/> <meta name="keywords"${$.attr('content', meta().keywords.join(', '))}/> <meta property="og:title"${$.attr('content', meta().og.title)}/> <meta property="og:description"${$.attr('content', meta().og.description)}/> <meta property="og:type"${$.attr('content', meta().og.type)}/> <meta property="og:image"${$.attr('content', meta().og.image)}/> <meta property="og:image:alt"${$.attr('content', meta().og.imageAlt)}/> <meta property="og:url"${$.attr('content', meta().og.url)}/> <meta name="twitter:title"${$.attr('content', meta().twitter.title)}/> <meta name="twitter:description"${$.attr('content', meta().twitter.description)}/> <meta name="twitter:card"${$.attr('content', meta().twitter.card)}/> <meta name="twitter:image"${$.attr('content', meta().twitter.image)}/> <meta name="twitter:image:alt"${$.attr('content', meta().twitter.imageAlt)}/> <meta name="twitter:site"${$.attr('content', meta().twitter.site)}/> <meta name="twitter:creator"${$.attr('content', meta().twitter.creator)}/> <link${$.attr('href', meta().canonical)} rel="canonical"/> <link type="text/plain" rel="author"${$.attr('href', `${$.stringify($.store_get($$store_subs ??= {}, '$page', page).url.origin)}/humans.txt`)}/> <meta name="mode"${$.attr('content', PUBLIC_MODE)}/>`);
		});

		children($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}