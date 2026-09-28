import * as $ from 'svelte/internal/server';

export default function CheckBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { checked = void 0, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<input${$.attributes({ type: 'checkbox', checked, ...rest }, void 0, void 0, void 0, 4)}/>`);
		$.bind_props($$props, { checked });
	});
}