import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Checkbox from './_Checkbox.svelte';
import EndAlignment from './_EndAlignment.svelte';
import Radio from './_Radio.svelte';
import Switch from './_Switch.svelte';

export default function _page($$renderer) {
	$.head('12gabdi', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Form Field - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Form Fields</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/form-field</pre> <h5>Demos</h5> `);

	Demo($$renderer, {
		component: Checkbox,
		file: 'form-field/_Checkbox.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Checkbox`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: EndAlignment,
		file: 'form-field/_EndAlignment.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->End alignment`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Radio,
		file: 'form-field/_Radio.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Radio button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Switch,
		file: 'form-field/_Switch.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}