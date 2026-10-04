import * as $ from 'svelte/internal/server';

export default function Options_custom_props_rest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, $$slots, $$events, ...rest } = $$props;
		$$renderer.push(`<p>${$.escape(value)} ${$.escape(rest.other)}</p>`);
	});
}
