import * as $ from 'svelte/internal/server';
import FeatureSection from "$lib/web/layouts/FeatureSection.svelte";
import FeatureSectionTwo from "$lib/web/layouts/FeatureSectionTwo.svelte";
import SiteHero from "$lib/web/layouts/SiteHero.svelte";

export default function _page($$renderer) {
	$.head('h7bcrl', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Svelte Shadcn Blocks - 150+ UI &amp; Marketing Blocks</title>`);
		});

		$$renderer.push(`<meta name="description" content="Svelte Shadcn Blocks offers 150+ UI &amp; marketing components for building responsive landing pages."/> <meta property="og:title" content="Svelte Shadcn Blocks - 50+ UI &amp; Marketing Blocks"/> <meta property="og:description" content="Svelte Shadcn Blocks offers 150+ UI &amp; marketing components for building responsive landing pages."/> <meta property="og:image" content="https://sv-blocks.vercel.app/og.png"/> <meta property="og:url" content="https://sv-blocks.vercel.app"/> <meta property="og:type" content="website"/> <meta name="twitter:title" content="Svelte Shadcn Blocks - 50+ UI &amp; Marketing Blocks"/> <meta name="twitter:description" content="Svelte Shadcn Blocks offers 150+ UI &amp; marketing components for building responsive landing pages."/> <meta name="twitter:image" content="https://sv-blocks.vercel.app/og.png"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="keywords" content="Svelte UI components, Blocks, Svelte blocks,  Svelte marketing blocks, ShadCN-Svelte, responsive UI, landing page builder, Svelte 5, Tailwind v4, Svelte Shadcn Blocks, Svelte marketing components, Svelte UI library, Svelte templates, Svelte components, Svelte UI kit"/> <meta name="author" content="Sikandar_Bhide"/> <link rel="canonical" href="https://sv-blocks.vercel.app"/>`);
	});

	SiteHero($$renderer, {});
	$$renderer.push(`<!----> `);
	FeatureSection($$renderer, {});
	$$renderer.push(`<!---->`);
}