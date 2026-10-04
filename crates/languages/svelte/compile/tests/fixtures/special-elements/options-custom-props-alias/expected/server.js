import * as $ from 'svelte/internal/server';

export default function Options_custom_props_alias($$renderer, $$props) {
	let { value: local } = $$props;
	$$renderer.push(`<p>${$.escape(local)}</p>`);
}
