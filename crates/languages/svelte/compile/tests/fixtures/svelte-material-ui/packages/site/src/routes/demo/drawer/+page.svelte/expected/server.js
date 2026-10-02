import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Permanent from './_Permanent.svelte';
import Dismissible from './_Dismissible.svelte';
import Modal from './_Modal.svelte';

export default function _page($$renderer) {
	$.head('1y2emuw', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Drawers - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Drawers</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/drawer</pre> <h5>Demos</h5> `);

	Demo($$renderer, {
		component: Permanent,
		file: 'drawer/_Permanent.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A permanent drawer`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Dismissible,
		file: 'drawer/_Dismissible.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A dismissible drawer with a header and activated items`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Modal,
		file: 'drawer/_Modal.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->A modal drawer with header, activated items, subheading, icons, list groups`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}