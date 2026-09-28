import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, $$slots, $$events, ...properties } = $$props;

		$$renderer.push(`<button${$.attributes({ ...properties })}>${$.escape(value)}</button>`);
		$.bind_props($$props, { value });
	});
}