import * as $ from 'svelte/internal/server';
import GenericPopout from './GenericPopout.svelte';

export default function Nested_props2_input($$renderer, $$props) {
	let { position } = $$props;

	GenericPopout($$renderer, {
		position,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Test`);
		},
		$$slots: { default: true }
	});
}