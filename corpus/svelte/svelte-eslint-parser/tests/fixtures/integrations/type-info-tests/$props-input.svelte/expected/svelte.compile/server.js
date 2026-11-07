import * as $ from 'svelte/internal/server';

export default function $props_input($$renderer, $$props) {
	const { x } = $$props;

	$$renderer.push(`<div>${$.escape(x)}</div>`);
}