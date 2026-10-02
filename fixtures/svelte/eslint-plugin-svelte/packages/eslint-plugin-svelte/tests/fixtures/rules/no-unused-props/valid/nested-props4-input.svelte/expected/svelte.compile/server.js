import * as $ from 'svelte/internal/server';
import GenericPopout from './GenericPopout.svelte';

export default function Nested_props4_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { wrapper } = $$props;

		GenericPopout($$renderer, {
			x: wrapper.position.x,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Test`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		GenericPopout($$renderer, {
			position: wrapper.position,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Test`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}