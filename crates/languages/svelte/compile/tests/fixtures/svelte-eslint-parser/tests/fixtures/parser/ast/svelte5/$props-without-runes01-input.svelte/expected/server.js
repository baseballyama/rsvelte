import * as $ from 'svelte/internal/server';

export default function $props_without_runes01_input($$renderer, $$props) {
	const { p } = $$props;

	$$renderer.push(`<span>${$.escape(p)}</span>`);
}