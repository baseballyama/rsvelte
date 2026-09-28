import * as $ from 'svelte/internal/server';
import MyClassAdder from './_ClassAdderComponent.svelte';

export default function _ClassAdder($$renderer) {
	$$renderer.push(`<div class="svelte-htnd1v">`);

	MyClassAdder($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->I'm a component with an added class!`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}