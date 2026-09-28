import * as $ from 'svelte/internal/server';

export default function Content($$renderer, $$props) {
	let { text } = $$props;

	$$renderer.push(`<span>${$.escape(text)}</span>`);
}