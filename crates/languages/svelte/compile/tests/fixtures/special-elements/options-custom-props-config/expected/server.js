import * as $ from 'svelte/internal/server';

export default function Options_custom_props_config($$renderer, $$props) {
	let { enabled = false, count } = $$props;
	$$renderer.push(`<p>${$.escape(enabled)}: ${$.escape(count)}</p>`);
}
