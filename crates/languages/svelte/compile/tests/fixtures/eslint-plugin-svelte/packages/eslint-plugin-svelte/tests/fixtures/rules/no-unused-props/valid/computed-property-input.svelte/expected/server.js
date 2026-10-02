import * as $ from 'svelte/internal/server';

export default function Computed_property_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props['dynamic']);
	});
}