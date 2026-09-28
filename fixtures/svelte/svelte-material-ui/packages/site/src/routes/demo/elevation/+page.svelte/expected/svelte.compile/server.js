import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Elevation from './_Elevation.svelte';
import TransitionsAndColor from './_TransitionsAndColor.svelte';

export default function _page($$renderer) {
	$.head('pqw54u', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Elevation - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Elevation</h2> <p>Part of <code>@smui/common</code>.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/common</pre> <h5>Demos</h5> `);

	Demo($$renderer, {
		component: Elevation,
		files: ['elevation/_Elevation.svelte', 'elevation/_Elevation.scss']
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: TransitionsAndColor,
		files: [
			'elevation/_TransitionsAndColor.svelte',
			'elevation/_TransitionsAndColor.scss'
		],

		children: ($$renderer) => {
			$$renderer.push(`<!---->Transitions and color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}