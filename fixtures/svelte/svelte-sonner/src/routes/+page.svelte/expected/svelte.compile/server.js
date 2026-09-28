import * as $ from 'svelte/internal/server';
import { Toaster } from '$lib/index.js';
import Expand from '../components/Expand.svelte';
import Footer from '../components/Footer.svelte';
import Hero from '../components/Hero.svelte';
import Installation from '../components/Installation.svelte';
import Other from '../components/Other.svelte';
import Position from '../components/Position.svelte';
import Types from '../components/Types.svelte';
import Usage from '../components/Usage.svelte';
import { richColorsContext } from '$lib/internal/ctx.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let expand = false;
		let position = 'bottom-right';
		let richColors = false;
		let closeButton = false;

		richColorsContext.set({ setRichColors: (value) => richColors = value });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1uha8ag', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Svelte Sonner</title>`);
				});

				$$renderer.push(`<meta content="width=device-width, initial-scale=1" name="viewport"/> <meta name="description" content="An opinionated toast component for Svelte."/> <meta name="keywords" content="svelte, toast, notification, web"/> <meta name="author" content="Robert Soriano"/> <meta name="og:title" content="Svelte Sonner"/> <meta name="og:description" content="An opinionated toast component for Svelte."/> <meta property="og:site_name" content="Svelte Sonner"/> <meta property="og:url" content="https://svelte-sonner.vercel.app"/> <meta property="og:image" content="https://og-image.vercel.app/Svelte%20Sonner"/> <link rel="icon" href="/favicon.png"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site" content="@wobsoriano"/> <meta name="twitter:description" content="An opinionated toast component for Svelte."/> <meta name="twitter:title" content="Svelte Sonner"/> <meta name="twitter:image" content="https://og-image.vercel.app/Svelte%20Sonner"/>`);
			});

			Toaster($$renderer, { expand, position, richColors, closeButton });
			$$renderer.push(`<!----> <main class="container">`);
			Hero($$renderer, {});
			$$renderer.push(`<!----> <div class="content">`);
			Installation($$renderer, {});
			$$renderer.push(`<!----> `);
			Usage($$renderer, {});
			$$renderer.push(`<!----> `);
			Types($$renderer, {});
			$$renderer.push(`<!----> `);
			Position($$renderer, { position, setPosition: (pos) => position = pos });
			$$renderer.push(`<!----> `);
			Expand($$renderer, { expand, setExpand: (exp) => expand = exp });
			$$renderer.push(`<!----> `);

			Other($$renderer, {
				setRichColors: (value) => richColors = value,
				get closeButton() {
					return closeButton;
				},

				set closeButton($$value) {
					closeButton = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></main> `);
			Footer($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}