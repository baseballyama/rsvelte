import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Buffered from './_Buffered.svelte';
import Indeterminate from './_Indeterminate.svelte';
import Colored from './_Colored.svelte';

export default function _page($$renderer) {
	$.head('1xao8w6', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Linear Progress - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Linear Progress</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/linear-progress</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'linear-progress/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Buffered,
		file: 'linear-progress/_Buffered.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Buffered`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Indeterminate,
		file: 'linear-progress/_Indeterminate.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Indeterminate`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: [
			'linear-progress/_Colored.svelte',
			'linear-progress/_Colored.scss'
		],

		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}