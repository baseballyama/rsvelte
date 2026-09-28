import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MetaTags } from "svelte-meta-tags";

export default function MetaTag($$anchor, $$props) {
	$.push($$props, true);

	let breadcrumb_title = $.prop($$props, 'breadcrumb_title', 3, ""),
		description = $.prop($$props, 'description', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		dir = $.prop($$props, 'dir', 3, ""),
		pkg = $.prop($$props, 'pkg', 3, "Flowbite Svelte");

	// title = title.replaceAll(' ', '-');
	let imgsrc = $.derived(() => `https://flowbite-svelte.com/og?title=${encodeURIComponent(breadcrumb_title())}&package=${encodeURIComponent(pkg())}`);

	let dirstring = $.derived(() => dir() ? dir().toLowerCase() : "");

	let breadcrumb = $.derived(() => breadcrumb_title() && breadcrumb_title().length > 0
		? breadcrumb_title().toLowerCase().replaceAll(" ", "-")
		: "");

	{
		let $0 = $.derived(() => ({
			type: "website",
			url: `https://flowbite-svelte-blocks.codewithshin.com/${$.get(dirstring)}${$.get(breadcrumb) ? `/${$.get(breadcrumb)}` : ""}`,
			title: `${title()}`,
			description: `${description()}`,
			images: [
				{
					url: $.get(imgsrc),
					width: 1200,
					height: 630,
					alt: `${title()}`
				}
			],
			siteName: "Flowbite Svelte"
		}));

		let $1 = $.derived(() => ({
			creator: "@shinokada",
			cardType: "summary_large_image",
			title: `${title()}`,
			description: `${description()}`,
			image: $.get(imgsrc),
			imageAlt: `${title()}`
		}));

		MetaTags($$anchor, {
			get title() {
				return breadcrumb_title();
			},
			titleTemplate: '%s - Flowbite',
			get description() {
				return description();
			},
			facebook: { appId: "453670756870545" },
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