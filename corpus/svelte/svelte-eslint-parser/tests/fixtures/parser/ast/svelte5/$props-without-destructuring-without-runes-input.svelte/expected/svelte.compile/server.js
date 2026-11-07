import * as $ from 'svelte/internal/server';

export default function $props_without_destructuring_without_runes_input($$renderer, $$props) {
	// It should be recognized as a store.
	const { $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<span>${$.escape(props)}</span>`);
}