import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';
import Leaf from './Leaf.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		name: 'foo',
		children: ($$renderer) => {
			Nested($$renderer, {
				name: 'bar',
				children: ($$renderer) => {
					Leaf($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Nested($$renderer, {
				name: 'baz',
				children: ($$renderer) => {
					Leaf($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}