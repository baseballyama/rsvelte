import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';

export default function _page($$renderer) {
	$.head('14qd1u', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Touch Target - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Touch Target</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/touch-target</pre> <h5>Demos</h5> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->These interactive components all have large touch targets, and they won't
      overlap because of the touch target wrapper.`);
		}

		Demo($$renderer, {
			component: Simple,
			file: 'touch-target/_Simple.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Touch Target Wrapper`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}