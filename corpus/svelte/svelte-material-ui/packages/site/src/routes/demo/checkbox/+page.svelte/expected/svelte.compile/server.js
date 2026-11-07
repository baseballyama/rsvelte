import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Touch from './_Touch.svelte';
import Group from './_Group.svelte';
import Indeterminate from './_Indeterminate.svelte';
import Colored from './_Colored.svelte';

export default function _page($$renderer) {
	$.head('1sp5vro', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Checkbox - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Checkbox</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/checkbox</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'checkbox/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Touch,
		file: 'checkbox/_Touch.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Increased touch target`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Group,
		file: 'checkbox/_Group.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Group checkbox`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Indeterminate,
		file: 'checkbox/_Indeterminate.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Indeterminate`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Colored,
		files: ['checkbox/_Colored.svelte', 'checkbox/_Colored.scss'],
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored (using Sass mixins)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}