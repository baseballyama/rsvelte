import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Prefilled from './_Prefilled.svelte';
import Combobox from './_Combobox.svelte';
import Objects from './_Objects.svelte';
import AddEntries from './_AddEntries.svelte';
import AddToList from './_AddToList.svelte';
import Async from './_Async.svelte';
import FullWidth from './_FullWidth.svelte';
import CustomDisplay from './_CustomDisplay.svelte';
import Manual from './_Manual.svelte';

export default function _page($$renderer) {
	$.head('l7exe9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Autocomplete - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-l7exe9"><h2 class="svelte-l7exe9">Auto<wbr class="svelte-l7exe9"/>complete</h2> <h5 class="svelte-l7exe9">Installation</h5> <pre class="demo-spaced svelte-l7exe9">npm i -D @smui-extra/autocomplete</pre> <h5 class="svelte-l7exe9">Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'autocomplete/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Prefilled,
		file: 'autocomplete/_Prefilled.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Prefilled value`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->A combobox lets the user input any text, but provides autocomplete
      functionality as well.`);
		}

		Demo($$renderer, {
			component: Combobox,
			file: 'autocomplete/_Combobox.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Combobox`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Objects,
		file: 'autocomplete/_Objects.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Objects as options`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: AddEntries,
		file: 'autocomplete/_AddEntries.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Adding entries`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Leave the menu open and don't fill the textbox upon selection.`);
		}

		Demo($$renderer, {
			component: AddToList,
			file: 'autocomplete/_AddToList.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Add entries to a list`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Autocomplete supports retrieving results asynchronously, like from a REST
      endpoint. Try typing a letter in the box below.`);
		}

		Demo($$renderer, {
			component: Async,
			file: 'autocomplete/_Async.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Async options loading`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: FullWidth,
		file: 'autocomplete/_FullWidth.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Full width`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: CustomDisplay,
		file: 'autocomplete/_CustomDisplay.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Custom item display`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Manual,
		file: 'autocomplete/_Manual.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Manual setup`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}