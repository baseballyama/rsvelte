import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { random } = $$props;

	$$renderer.push(`<p>${$.escape(random)}</p> <p>${$.escape(random)}</p> <p>${$.escape(random)}</p>`);
}