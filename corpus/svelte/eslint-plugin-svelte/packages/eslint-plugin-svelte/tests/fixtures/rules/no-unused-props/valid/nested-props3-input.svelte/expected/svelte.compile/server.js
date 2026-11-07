import * as $ from 'svelte/internal/server';
import GenericPopout from './GenericPopout.svelte';

export default function Nested_props3_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { wrapper } = $$props;

		GenericPopout($$renderer, {
			position: wrapper.position,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Test`);
			},
			$$slots: { default: true }
		});
	});
}