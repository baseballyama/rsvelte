import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { value } = $$props;

	$$renderer.push(`<h1>${$.escape(value)}</h1>`);
}