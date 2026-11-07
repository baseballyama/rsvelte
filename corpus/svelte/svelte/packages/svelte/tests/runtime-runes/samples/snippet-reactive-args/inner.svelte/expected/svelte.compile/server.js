import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	let { count } = $$props;

	console.log(count);
	$$renderer.push(`<p>component: ${$.escape(count)}</p>`);
}