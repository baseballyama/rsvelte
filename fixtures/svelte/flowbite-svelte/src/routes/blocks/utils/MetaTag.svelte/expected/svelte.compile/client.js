import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MetaTags } from "svelte-meta-tags";

export default function MetaTag($$anchor, $$props) {
	$.push($$props, true);

	let imgsrc = $.derived(() => `https://flowbite-svelte.com/og?package=Flowbite%20Svelte%20Blocks&title=${encodeURIComponent($$props.breadcrumb_title || "")}`);
	let dirstring = $.derived(() => $$props.dir?.toLowerCase());
	let breadcrumb = $.derived(() => $$props.breadcrumb_title?.toLowerCase().replaceAll(" ", "-"));

	let finalBreadcrumbTitle = $.derived(() => $$props.breadcrumb_title && $$props.breadcrumb_title.length > 0
		? $$props.breadcrumb_title
		: $$props.title?.split("-")[0] ?? "Flowbite Svelte Blocks");

	{
		let $0 = $.derived(() => ({
			type: "website",
			url: `https://flowbite-svelte-blocks.codewithshin.com/${$.get(dirstring)}/${$.get(breadcrumb)}`,
			title: `${$$props.title}`,
			description: `${$$props.description}`,
			images: [
				{
					url: $.get(imgsrc),
					width: 1200,
					height: 630,
					alt: `${$$props.title}`
				}
			],
			siteName: "Flowbite-Svelte-Blocks"
		}));

		let $1 = $.derived(() => ({
			creator: "@shinokada",
			cardType: "summary_large_image",
			title: `${$$props.title}`,
			description: `${$$props.description}`,
			image: $.get(imgsrc),
			imageAlt: `${$$props.title}`
		}));

		MetaTags($$anchor, {
			get title() {
				return $.get(finalBreadcrumbTitle);
			},
			titleTemplate: '%s - Flowbite Svelte Blocks',
			get description() {
				return $$props.description;
			},
			facebook: { appId: "672622757749720" },
			get openGraph() {
				return $.get($0);
			},

			get twitter() {
				return $.get($1);
			}
		});
	}

	$.pop();
}