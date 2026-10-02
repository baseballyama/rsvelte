import * as $ from 'svelte/internal/server';

export default function PickerIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** indicator position in % */
		let { pos } = $$props;

		$$renderer.push(`<div class="picker-indicator svelte-1k6x07n"${$.attr_style('', { '--pos-x': pos.x, '--pos-y': pos.y })}></div>`);
	});
}