import * as $ from 'svelte/internal/server';

export default function _8_3_$bindable_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { bindableProp = 'fallback' } = $$props;

		$.bind_props($$props, { bindableProp });
	});
}