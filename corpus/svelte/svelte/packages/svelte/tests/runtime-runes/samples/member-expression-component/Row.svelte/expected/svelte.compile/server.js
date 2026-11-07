import * as $ from 'svelte/internal/server';

export default function Row($$renderer, $$props) {
	let { id } = $$props;

	$$renderer.push(`<span>${$.escape(id)}</span>`);
}