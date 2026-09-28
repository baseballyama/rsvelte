import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Square from './_Square.svelte';
import PrimaryColor from './_PrimaryColor.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Colored from './_Colored.svelte';
import ElevationTransition from './_ElevationTransition.svelte';

export default function _page($$renderer) {
	$.head('x2s8yd', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Paper - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-x2s8yd"><h2 class="svelte-x2s8yd">Paper</h2> <h5 class="svelte-x2s8yd">Installation</h5> <pre class="demo-spaced svelte-x2s8yd">npm i -D @smui/paper</pre> <h5 class="svelte-x2s8yd">Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'paper/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Square,
		file: 'paper/_Square.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Square paper`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: PrimaryColor,
		file: 'paper/_PrimaryColor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Primary color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SecondaryColor,
		file: 'paper/_SecondaryColor.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary color`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: ['paper/_Colored.svelte', 'paper/_Colored.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ElevationTransition,
		file: 'paper/_ElevationTransition.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Elevation and transition`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}