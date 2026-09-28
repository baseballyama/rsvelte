import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { text } = $$props;

	$$renderer.push(`<p>${$.escape(text)}</p>`);
}