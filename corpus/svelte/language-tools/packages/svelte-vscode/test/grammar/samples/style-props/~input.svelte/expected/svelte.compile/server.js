import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.css_props($$renderer, true, { '--rail-color': 'black' }, () => {
		Component($$renderer, {});
	});
}