import * as $ from 'svelte/internal/server';
import Nested from "./Nested.svelte";
import Leaf from "./Leaf.svelte";

export default function Main($$renderer) {
	Nested($$renderer, {
		value: 'bar',
		children: ($$renderer) => {
			Leaf($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Nested($$renderer, {
		children: ($$renderer) => {
			Leaf($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}