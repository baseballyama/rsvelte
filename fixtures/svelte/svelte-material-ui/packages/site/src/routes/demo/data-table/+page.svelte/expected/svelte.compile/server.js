import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import ProgressIndicator from './_ProgressIndicator.svelte';
import StickyHeader from './_StickyHeader.svelte';
import RowSelection from './_RowSelection.svelte';
import Pagination from './_Pagination.svelte';
import Sortable from './_Sortable.svelte';

export default function _page($$renderer) {
	$.head('1wihlh0', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Data Table - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Data Table</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/data-table</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'data-table/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ProgressIndicator,
		file: 'data-table/_ProgressIndicator.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Progress indicator`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->This is displayed in an iframe and the source viewer shows the iframe
      source. Sticky headers don't work if any ancestor element has the
      "overflow" style set to "hidden", "scroll", or "auto".`);
		}

		Demo($$renderer, {
			component: StickyHeader,
			file: 'data-table/iframe/+page.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Sticky header`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: RowSelection,
		file: 'data-table/_RowSelection.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Row selection`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Pagination,
		file: 'data-table/_Pagination.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Pagination`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Sortable,
		file: 'data-table/_Sortable.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Sortable`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}