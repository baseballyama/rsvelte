import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Static from './_Static.svelte';
import Anchored from './_Anchored.svelte';
import ManualAnchor from './_ManualAnchor.svelte';

export default function _page($$renderer) {
	$.head('c7e1ao', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Menu Surface - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Menu Surface</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/menu-surface</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'menu-surface/_Simple.svelte' });
	$$renderer.push(`<!----> `);
	Demo($$renderer, { component: Static, file: 'menu-surface/_Static.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Anchored,
		file: 'menu-surface/_Anchored.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Anchored automatically, corner set to bottom-left`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ManualAnchor,
		files: [
			'menu-surface/_ManualAnchor.svelte',
			'menu-surface/_ManualAnchor.scss'
		],

		children: ($$renderer) => {
			$$renderer.push(`<!---->Anchored manually, origin corner flipped horizontally`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div style="padding-top: 200px;">Long div for scrolling...</div></section>`);
}