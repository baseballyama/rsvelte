import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Icons from './_Icons.svelte';
import KeyedIconsAboveRestrictedIndicatorsFadeTransition from './_KeyedIconsAboveRestrictedIndicatorsFadeTransition.svelte';
import ScrollingNoInitialActive from './_ScrollingNoInitialActive.svelte';
import MinWidth from './_MinWidth.svelte';
import IconIndicators from './_IconIndicators.svelte';
import HrefAnchors from './_HrefAnchors.svelte';

export default function _page($$renderer) {
	$.head('1lmrayd', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Tabs - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-1lmrayd"><h2>Tabs</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/tab @smui/tab-bar</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'tabs/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Icons,
		file: 'tabs/_Icons.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tabs with icons next to labels`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: KeyedIconsAboveRestrictedIndicatorsFadeTransition,
		file: 'tabs/_KeyedIconsAboveRestrictedIndicatorsFadeTransition.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Keyed tabs with icons above labels, indicators restricted to content, and
    fade transition`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ScrollingNoInitialActive,
		file: 'tabs/_ScrollingNoInitialActive.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Scrolling tabs with no initial active tab`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: MinWidth,
		file: 'tabs/_MinWidth.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Min width tabs`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: IconIndicators,
		file: 'tabs/_IconIndicators.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Icon indicators`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->But they don't activate through keyboard arrow keys. They need to be
      activated with the enter key.`);
		}

		Demo($$renderer, {
			component: HrefAnchors,
			file: 'tabs/_HrefAnchors.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Tabs with href attributes render as anchor elements`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}