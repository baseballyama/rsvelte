import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FlowbiteSvelteLayout from "./layouts/FlowbiteSvelteLayout.svelte";
import { MetaTags } from "svelte-meta-tags";
import Components from "./landing/Components.svelte";
import Featured from "./landing/Featured.svelte";
import Hero from "./landing/Hero.svelte";
import Footer from "./utils/Footer.svelte";
import Contributors from "./landing/Contributors.svelte";
import DesignFigma from "./landing/DesignFigma.svelte";
import GetStarted from "./landing/GetStarted.svelte";
import SocialProof from "./landing/SocialProof.svelte";
import CTA from "./landing/CTA.svelte";

var root = $.from_html(`<!> <main class="min-w-0 flex-auto divide-y lg:static lg:max-h-full lg:overflow-visible dark:divide-gray-700"><!> <!> <!> <!> <!> <!> <!> <!> <!></main>`, 1);

export default function _page($$anchor, $$props) {
	let title = "Flowbite Svelte - UI Component Library";
	let description = "Flowbite Svelte is an open-source UI component library built with Svelte components, Tailwind CSS utility classes and based on the Flowbite design system and components.";
	let default_title = "Svelte UI Components";
	const image = `https://flowbite-svelte.com/og?title=${default_title}`;

	FlowbiteSvelteLayout($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			MetaTags(node, {
				title,
				description,
				facebook: { appId: "453670756870545" },
				openGraph: {
					type: "website",
					url: `https://flowbite-svelte.com/`,
					title: `${title}`,
					description: `${description}`,
					images: [{ url: image, width: 1200, height: 630, alt: `${title}` }],
					siteName: "Flowbite Svelte"
				},
				twitter: {
					creator: "@shinokada",
					cardType: "summary_large_image",
					title: `${title}`,
					description: `${description}`,
					image,
					imageAlt: `${title} logo`
				}
			});

			var main = $.sibling(node, 2);
			var node_1 = $.child(main);

			Hero(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Featured(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			Components(node_3, {
				get data() {
					return $$props.data;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			CTA(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			SocialProof(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			DesignFigma(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			Contributors(node_7, {
				get data() {
					return $$props.data;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			GetStarted(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			Footer(node_9, {});
			$.reset(main);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}