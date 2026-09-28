import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!----> `);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span> </span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`${$.html("&nbsp;")}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}