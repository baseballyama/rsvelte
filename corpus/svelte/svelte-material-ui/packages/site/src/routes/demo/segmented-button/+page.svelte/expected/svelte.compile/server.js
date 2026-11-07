import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import SingleSelection from './_SingleSelection.svelte';
import GroupSelection from './_GroupSelection.svelte';
import ManualSelection from './_ManualSelection.svelte';
import IconsKeys from './_IconsKeys.svelte';
import Touch from './_Touch.svelte';

export default function _page($$renderer) {
	$.head('h4daaa', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Segmented Button - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Segmented Button</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/segmented-button</pre> <h5>Demos</h5> `);

	Demo($$renderer, {
		component: SingleSelection,
		file: 'segmented-button/_SingleSelection.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Single Selection`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: GroupSelection,
		file: 'segmented-button/_GroupSelection.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Group Selection`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ManualSelection,
		file: 'segmented-button/_ManualSelection.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Manual Selection`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: IconsKeys,
		file: 'segmented-button/_IconsKeys.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Icons and Keyed Segments`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Touch,
		file: 'segmented-button/_Touch.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Increased Touch Target`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}