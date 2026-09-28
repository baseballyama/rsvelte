import * as $ from 'svelte/internal/server';

export default function TestWithProps($$renderer, $$props) {
	let { message } = $$props;

	$$renderer.push(`<div>${$.html(message)}</div>`);
}