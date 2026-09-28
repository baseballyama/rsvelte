import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { thing } = $$props;

	$$renderer.push(`<p>${$.escape(thing)}</p>`);
}