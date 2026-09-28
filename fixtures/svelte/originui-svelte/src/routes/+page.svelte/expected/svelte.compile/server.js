import * as $ from 'svelte/internal/server';
import CategoryCard from '$lib/demo/category-card.svelte';
import Illustration from '$lib/demo/illustration.svelte';
import { mode } from 'mode-watcher';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		$.head('1uha8ag', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Origin UI - Svelte | Beautiful UI components built with Tailwind CSS and Svelte</title>`);
			});

			$$renderer.push(`<meta name="theme-color"${$.attr('content', $.store_get($$store_subs ??= {}, '$mode', mode) === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)')}/> <meta name="Description" content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."/> <meta name="keywords" content="svelte, component, origin ui, tailwindcss, ui, library"/> <meta property="og:title" content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."/> <meta property="og:description" content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."/> <meta property="og:image:type" content="image/jpeg"/><meta property="og:image:width" content="2400"/> <meta property="og:image:height" content="1260"/> <meta property="og:image" content="/og-image.jpg"/> <meta name="twitter:title" content="Origin UI - Svelte"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:description" content="An extensive collection of copy-and-paste Svelte components for quickly building app UIs."/> <meta name="twitter:image:type" content="image/jpeg"/> <meta name="twitter:image:width" content="2400"/> <meta name="twitter:image:height" content="1260"/> <meta name="twitter:image" content="/twitter-image.jpg"/>`);
		});

		Illustration($$renderer, {});
		$$renderer.push(`<!----> <main data-home=""><div class="max-w-3xl max-sm:text-center"><h1 class="font-heading text-foreground mb-4 font-serif text-4xl/[1.1] tracking-tight text-balance md:text-5xl/[1.1]">Beautiful UI components built with Tailwind CSS and <span class="text-svelte">Svelte</span></h1> <p class="text-md text-muted-foreground mb-4">A collection of copy-and-paste components for quickly build application UIs.</p> <p class="border-border text-accent-foreground w-fit max-w-prose border-t pt-4 text-left text-sm text-balance">This project is not affiliated with the original <a class="underline" href="https://originui.com/" rel="noreferrer">Origin UI</a>. <br/> <span class="text-muted-foreground text-xs">I appreciate their work and have developed these Svelte 5 components based on their design.</span></p></div> <div class="relative my-16"><div class="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"><!--[-->`);

		const each_array = $.ensure_array_like(Object.entries(data.componentsMeta.directoriesBreakdown));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [directory, { componentCount, stateBreakdown }] = each_array[$$index];
			const readableName = directory.charAt(0).toUpperCase() + directory.slice(1);
			const isReady = stateBreakdown.ready === componentCount;

			{
				function details($$renderer) {
					$$renderer.push(`<h2 class="_component-directory"><a${$.attr('href', `/${$.stringify(directory)}`)} class="text-sm font-medium hover:underline">${$.escape(readableName)}</a></h2> <p class="text-muted-foreground text-[13px]">`);

					if (isReady) {
						$$renderer.push(`<!--[0-->${$.escape(stateBreakdown.ready)} Components`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(stateBreakdown.ready)}/${$.escape(componentCount)} Components`);
					}

					$$renderer.push(`<!--]--></p>`);
				}

				CategoryCard($$renderer, {
					slug: directory,
					alt: `${$.stringify(readableName)} demo`,
					details,
					$$slots: { details: true }
				});
			}
		}

		$$renderer.push(`<!--]--></div></div></main>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}