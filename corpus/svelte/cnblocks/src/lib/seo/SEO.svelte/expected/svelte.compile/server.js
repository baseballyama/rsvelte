import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { MetaTags } from "svelte-meta-tags";

export default function SEO($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title,
			description,
			keywords,
			canonical,
			noindex = false,
			images
		} = $$props;

		let resolvedCanonical = $.derived(() => canonical ?? `${page.url.origin}${page.url.pathname}`);

		let resolvedImages = $.derived(() => images && images.length > 0
			? images
			: [
				{
					url: `${page.url.origin}/og.png`,
					width: 1200,
					height: 630,
					alt: "Svelte Marketing Blocks"
				}
			]);

		$.head('skm2cu', $$renderer, ($$renderer) => {
			if (keywords?.length) {
				$$renderer.push(`<!--[0--><meta name="keywords"${$.attr('content', keywords.join(", "))}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (noindex) {
				$$renderer.push(`<!--[0--><meta name="robots" content="noindex, nofollow"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		MetaTags($$renderer, {
			title,
			titleTemplate: '%s - Svelte Marketing Blocks',
			description,
			canonical: resolvedCanonical(),
			openGraph: {
				url: resolvedCanonical(),
				title,
				description,
				images: resolvedImages(),
				siteName: "Svelte Marketing Blocks"
			},
			twitter: {
				creator: "@Sikandar_Bhide",
				site: "@Sikandar_Bhide",
				cardType: "summary_large_image",
				title,
				description,
				image: resolvedImages()[0]?.url,
				imageAlt: resolvedImages()[0]?.alt ?? "Svelte Marketing Blocks"
			}
		});
	});
}