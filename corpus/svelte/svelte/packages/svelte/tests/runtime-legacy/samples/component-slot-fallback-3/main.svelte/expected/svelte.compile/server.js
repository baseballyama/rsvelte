import * as $ from 'svelte/internal/server';
import Inner from "./Inner.svelte";

export default function Main($$renderer) {
	Inner($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div>Hello World</div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Inner($$renderer, {});
	$$renderer.push(`<!---->`);
}