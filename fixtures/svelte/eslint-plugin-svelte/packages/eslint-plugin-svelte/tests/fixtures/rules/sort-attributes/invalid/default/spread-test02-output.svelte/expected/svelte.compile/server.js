import * as $ from 'svelte/internal/server';

export default function Spread_test02_output($$renderer) {
	let attrs;

	$$renderer.push(`<div${$.attributes({ b: true, c: true, ...attrs, id: true, a: true })}></div>`);
}