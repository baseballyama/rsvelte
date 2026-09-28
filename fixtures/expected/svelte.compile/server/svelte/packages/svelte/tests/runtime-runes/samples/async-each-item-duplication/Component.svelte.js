import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	let { message, another } = $$props;

	$$renderer.push(`<p>${$.escape(message)}</p>`);
}