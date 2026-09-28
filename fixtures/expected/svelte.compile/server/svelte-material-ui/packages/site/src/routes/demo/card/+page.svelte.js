import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Actions from './_Actions.svelte';
import Media from './_Media.svelte';
import List from './_List.svelte';
import Complex from './_Complex.svelte';

export default function _page($$renderer) {
	$.head('1k2a7ib', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Cards - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-1k2a7ib"><h2 class="svelte-1k2a7ib">Cards</h2> <h5 class="svelte-1k2a7ib">Installation</h5> <pre class="demo-spaced svelte-1k2a7ib">npm i -D @smui/card</pre> <h5 class="svelte-1k2a7ib">Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'card/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Actions,
		file: 'card/_Actions.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->With Actions`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Media,
		file: 'card/_Media.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->With Media`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: List,
		file: 'card/_List.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->With a List`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Complex,
		file: 'card/_Complex.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Complex`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}