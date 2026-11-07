import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	let { data } = $$props;
	let title = "Flowbite Svelte - UI Component Library";
	let description = "Flowbite Svelte is an open-source UI component library built with Svelte components, Tailwind CSS utility classes and based on the Flowbite design system and components.";
	let default_title = "Svelte UI Components";
	const image = `https://flowbite-svelte.com/og?title=${default_title}`;

	FlowbiteSvelteLayout($$renderer, {
		children: ($$renderer) => {
			MetaTags($$renderer, {
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

			$$renderer.push(`<!----> <main class="min-w-0 flex-auto divide-y lg:static lg:max-h-full lg:overflow-visible dark:divide-gray-700">`);
			Hero($$renderer, {});
			$$renderer.push(`<!----> `);
			Featured($$renderer, {});
			$$renderer.push(`<!----> `);
			Components($$renderer, { data });
			$$renderer.push(`<!----> `);
			CTA($$renderer, {});
			$$renderer.push(`<!----> `);
			SocialProof($$renderer, {});
			$$renderer.push(`<!----> `);
			DesignFigma($$renderer, {});
			$$renderer.push(`<!----> `);
			Contributors($$renderer, { data });
			$$renderer.push(`<!----> `);
			GetStarted($$renderer, {});
			$$renderer.push(`<!----> `);
			Footer($$renderer, {});
			$$renderer.push(`<!----></main>`);
		},
		$$slots: { default: true }
	});
}