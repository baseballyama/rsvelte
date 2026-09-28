import * as $ from 'svelte/internal/server';

export default function Props($$renderer, $$props) {
	let { name } = $$props;

	$$renderer.push(`<p>Hello ${$.escape(name)}!</p>`);
}