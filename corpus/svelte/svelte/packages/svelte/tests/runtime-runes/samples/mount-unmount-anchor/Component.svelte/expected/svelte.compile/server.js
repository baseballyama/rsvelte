import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	let { text = 'hello' } = $$props;

	$$renderer.push(`<p>${$.escape(text)}</p>`);
}