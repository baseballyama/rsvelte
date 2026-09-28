import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, $$slots, $$events, ...properties } = $$props;

		$$renderer.push(`<input${$.attributes({ value, ...properties }, void 0, void 0, void 0, 4)}/>`);
		$.bind_props($$props, { value });
	});
}