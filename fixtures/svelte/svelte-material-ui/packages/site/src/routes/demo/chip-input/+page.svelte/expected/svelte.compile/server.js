import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Validity from './_Validity.svelte';
import Objects from './_Objects.svelte';
import Autocomplete from './_Autocomplete.svelte';
import AutocompleteObjects from './_AutocompleteObjects.svelte';
import Async from './_Async.svelte';
import AddChipKeys from './_AddChipKeys.svelte';
import Disabled from './_Disabled.svelte';
import SvgRemoveIcons from './_SvgRemoveIcons.svelte';

export default function _page($$renderer) {
	$.head('smi2sm', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Chip Input - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Chip Input</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui-extra/chip-input</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'chip-input/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Validity,
		file: 'chip-input/_Validity.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Validity state`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Objects allow you to have duplicate entries.`);
		}

		Demo($$renderer, {
			component: Objects,
			file: 'chip-input/_Objects.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Objects`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Autocomplete,
		file: 'chip-input/_Autocomplete.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Autocomplete`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: AutocompleteObjects,
		file: 'chip-input/_AutocompleteObjects.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Autocomplete objects`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->The autocomplete in the chip input supports retrieving results
      asynchronously, like from a REST endpoint. Try typing a letter in the box
      below.`);
		}

		Demo($$renderer, {
			component: Async,
			file: 'chip-input/_Async.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Async options loading`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->You can control which keys add the current chip. This one uses space,
      comma, dash, and plus.`);
		}

		Demo($$renderer, {
			component: AddChipKeys,
			file: 'chip-input/_AddChipKeys.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Add chip keys`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Disabled,
		file: 'chip-input/_Disabled.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: SvgRemoveIcons,
		file: 'chip-input/_SvgRemoveIcons.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->SVG remove icons`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}