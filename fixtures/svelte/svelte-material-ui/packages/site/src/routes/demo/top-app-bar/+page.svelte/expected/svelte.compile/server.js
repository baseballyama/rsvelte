import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Static from './_Static.svelte';
import Variants from './_Variants.svelte';

export default function _page($$renderer) {
	$.head('xgb6b0', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Top App Bar - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Top App Bar</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/top-app-bar</pre> <h5>Demos</h5> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Only the "static" variant works inside containers.`);
		}

		Demo($$renderer, {
			component: Static,
			file: 'top-app-bar/_Static.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Top app bars in a container`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->These are displayed in iframes and the source viewer shows the iframe
      source.`);
		}

		Demo($$renderer, {
			component: Variants,
			files: [
				'top-app-bar/iframe/standard/+page.svelte',
				'top-app-bar/iframe/fixed/+page.svelte',
				'top-app-bar/iframe/dense/+page.svelte',
				'top-app-bar/iframe/prominent/+page.svelte',
				'top-app-bar/iframe/short/+page.svelte',
				'top-app-bar/iframe/short-closed/+page.svelte'
			],
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Page level top app bars`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}