import * as $ from 'svelte/internal/server';

export default function _3_input($$renderer) {
	$.css_props($$renderer, true, { '--rail-color': 'goldenrod' }, () => {
		Slider($$renderer, {});
	});
}