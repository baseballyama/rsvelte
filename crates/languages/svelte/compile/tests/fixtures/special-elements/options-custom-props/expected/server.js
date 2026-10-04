import * as $ from 'svelte/internal/server';

export default function Options_custom_props($$renderer, $$props) {
	let { value = true } = $$props;
	$$renderer.push(`<p>${$.escape(value)}</p>`);
}
