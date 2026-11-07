import * as $ from 'svelte/internal/server';

export default function _8_2_$bindable_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { bindableProp = void 0 } = $$props;

		$.bind_props($$props, { bindableProp });
	});
}