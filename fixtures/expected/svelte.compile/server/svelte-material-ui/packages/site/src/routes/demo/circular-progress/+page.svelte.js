import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Indeterminate from './_Indeterminate.svelte';
import FourColor from './_FourColor.svelte';
import Colored from './_Colored.svelte';

export default function _page($$renderer) {
	$.head('1vpx636', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Circular Progress - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Circular Progress</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/circular-progress</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'circular-progress/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Indeterminate,
		file: 'circular-progress/_Indeterminate.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Indeterminate`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: FourColor,
		files: [
			'circular-progress/_FourColor.svelte',
			'circular-progress/_FourColor.scss'
		],

		children: ($$renderer) => {
			$$renderer.push(`<!---->Four Color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: [
			'circular-progress/_Colored.svelte',
			'circular-progress/_Colored.scss'
		],

		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}