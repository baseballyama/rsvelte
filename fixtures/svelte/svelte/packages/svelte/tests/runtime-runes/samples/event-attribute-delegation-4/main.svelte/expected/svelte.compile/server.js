import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";
import Sub from "./sub.svelte";

export default function Main($$renderer) {
	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<button>main</button>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Sub($$renderer, {});
	$$renderer.push(`<!---->`);
}