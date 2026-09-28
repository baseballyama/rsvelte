import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Static from './_Static.svelte';
import Variants from './_Variants.svelte';
import Fab from './_Fab.svelte';
import InsetFab from './_InsetFab.svelte';
import Snackbar from './_Snackbar.svelte';

export default function _page($$renderer) {
	$.head('1mt8o9o', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Bottom App Bar - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Bottom App Bar</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui-extra/bottom-app-bar</pre> <h5>Use</h5> <p>Please note that the Material spec states "Bottom app bars should be used
    for mobile devices only".</p> <h5>Demos</h5> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Only the "static" variant works inside containers.`);
		}

		Demo($$renderer, {
			component: Static,
			file: 'bottom-app-bar/_Static.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Bottom app bars in a container`);
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
				'bottom-app-bar/iframe/standard/+page.svelte',
				'bottom-app-bar/iframe/fixed/+page.svelte'
			],
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Page level bottom app bars`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Fab,
		file: 'bottom-app-bar/_Fab.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->FABs`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->These are displayed in iframes so that content will appear behind the
      inset.`);
		}

		Demo($$renderer, {
			component: InsetFab,
			files: [
				'bottom-app-bar/iframe/inset-fab/+page.svelte',
				'bottom-app-bar/iframe/inset-fab-right/+page.svelte'
			],
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Inset FAB`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->The snackbar is positioned above the bottom app bar. Note: to follow
      scrolling adjustments with the "standard" variant, this requires the
      AutoAdjust component.`);
		}

		Demo($$renderer, {
			component: Snackbar,
			files: ['bottom-app-bar/iframe/snackbar/+page.svelte'],
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Snackbar positioning`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}