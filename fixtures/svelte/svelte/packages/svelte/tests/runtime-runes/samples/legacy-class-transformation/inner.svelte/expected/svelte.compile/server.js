import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	let { num } = $$props;

	$$renderer.push(`<p>${$.escape(num)}</p>`);
}