import * as $ from 'svelte/internal/server';

export default function Spread_bindable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, text = 'x', $$slots, $$events, ...properties } = $$props;
		$$renderer.push(`<button${$.attributes({ ...properties })}>${$.escape(value)}</button> <p${$.attr('title', text)}>${$.escape(text)}</p>`);
		$.bind_props($$props, { value, text });
	});
}
