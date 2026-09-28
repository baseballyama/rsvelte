import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MetaTags } from "runes-meta-tags";

export default function MetaTag($$anchor, $$props) {
	let imgsrc = $.derived(() => `https://flowbite-svelte.com/og?package=Flowbite%20Svelte%20Admin%20Dashboard&title=${$$props.subtitle}`);
	let og_url = $.derived(() => `https://flowbite-svelte.com/admin-dashboard${$$props.path}`);

	{
		let $0 = $.derived(() => ({
			type: "website",
			url: `${$.get(og_url)}`,
			title: `${$$props.title}`,
			description: `${$$props.description}`,
			image: $.get(imgsrc),
			imageWidth: 1200,
			imageHeight: 630,
			imageAlt: `${$$props.title}`,
			siteName: "Flowbite Svelte Admin Dashboard"
		}));

		let $1 = $.derived(() => ({
			creator: "@shinokada",
			card: "summary_large_image",
			title: `${$$props.title}`,
			description: `${$$props.description}`,
			image: $.get(imgsrc),
			imageAlt: `${$$props.title}`
		}));

		MetaTags($$anchor, {
			get title() {
				return $$props.title;
			},

			get description() {
				return $$props.description;
			},

			get og() {
				return $.get($0);
			},

			get twitter() {
				return $.get($1);
			}
		});
	}
}