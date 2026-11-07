import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Span from './_Span.svelte';
import Order from './_Order.svelte';
import FixedColumnWidth from './_FixedColumnWidth.svelte';
import Align from './_Align.svelte';
import Nested from './_Nested.svelte';

export default function _page($$renderer) {
	$.head('11uxx4g', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Layout Grid - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Layout Grid</h2> <p>Try resizing your window to see the cells adapt to the new size.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/layout-grid</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'layout-grid/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Span,
		file: 'layout-grid/_Span.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Span`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Order,
		file: 'layout-grid/_Order.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Order`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: FixedColumnWidth,
		file: 'layout-grid/_FixedColumnWidth.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Fixed Column Width`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Align,
		file: 'layout-grid/_Align.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Align`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Only use this if you must because it doesn't align well at some
      resolutions.`);
		}

		Demo($$renderer, {
			component: Nested,
			file: 'layout-grid/_Nested.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Nested`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}