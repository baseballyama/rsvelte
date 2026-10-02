import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import NonInteractive from './_NonInteractive.svelte';
import Choice from './_Choice.svelte';
import Filter from './_Filter.svelte';
import FilterIcons from './_FilterIcons.svelte';
import Input from './_Input.svelte';
import Keyed from './_Keyed.svelte';

export default function _page($$renderer) {
	$.head('zt8t8a', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Chips - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Chips</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/chips</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'chips/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: NonInteractive,
		file: 'chips/_NonInteractive.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Non-interactive chips`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Choice,
		file: 'chips/_Choice.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Choice chips`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Filter,
		file: 'chips/_Filter.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Filter chips with increased touch target`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: FilterIcons,
		file: 'chips/_FilterIcons.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->The same, but with leading icons`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Input,
		file: 'chips/_Input.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input chips`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Keyed,
		file: 'chips/_Keyed.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Keyed filter input chips`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}