import * as $ from 'svelte/internal/server';

export default function _8_4_$bindable_ts_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { bindableProp = 42 } = $$props;

		$.bind_props($$props, { bindableProp });
	});
}