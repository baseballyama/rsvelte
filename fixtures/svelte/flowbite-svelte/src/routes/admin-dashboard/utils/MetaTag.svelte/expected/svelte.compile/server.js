import * as $ from 'svelte/internal/server';
import { MetaTags } from "runes-meta-tags";

export default function MetaTag($$renderer, $$props) {
	let { path, description, title, subtitle } = $$props;
	let imgsrc = $.derived(() => `https://flowbite-svelte.com/og?package=Flowbite%20Svelte%20Admin%20Dashboard&title=${subtitle}`);
	let og_url = $.derived(() => `https://flowbite-svelte.com/admin-dashboard${path}`);

	MetaTags($$renderer, {
		title,
		description,
		og: {
			type: "website",
			url: `${og_url()}`,
			title: `${title}`,
			description: `${description}`,
			image: imgsrc(),
			imageWidth: 1200,
			imageHeight: 630,
			imageAlt: `${title}`,
			siteName: "Flowbite Svelte Admin Dashboard"
		},
		twitter: {
			creator: "@shinokada",
			card: "summary_large_image",
			title: `${title}`,
			description: `${description}`,
			image: imgsrc(),
			imageAlt: `${title}`
		}
	});
}