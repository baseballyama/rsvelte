import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { onclick } = $$props;

	$$renderer.push(`<button>A button</button>`);
}