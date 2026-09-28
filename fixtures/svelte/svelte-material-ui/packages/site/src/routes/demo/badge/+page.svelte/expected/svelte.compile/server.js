import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Square from './_Square.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Colored from './_Colored.svelte';
import PositionAlign from './_PositionAlign.svelte';

export default function _page($$renderer) {
	$.head('1tzh6oy', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Badge - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Badge</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui-extra/badge</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'badge/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Square,
		file: 'badge/_Square.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Square badge`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SecondaryColor,
		file: 'badge/_SecondaryColor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: ['badge/_Colored.svelte', 'badge/_Colored.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: PositionAlign,
		file: 'badge/_PositionAlign.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Positioning and Alignment`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}