import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Touch from './_Touch.svelte';
import Colored from './_Colored.svelte';

export default function _page($$renderer) {
	$.head('z2pk9e', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Radio - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Radio</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/radio</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'radio/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Touch,
		file: 'radio/_Touch.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Increased touch target`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: ['radio/_Colored.svelte', 'radio/_Colored.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}