import * as $ from 'svelte/internal/server';

export default function Spread_test01_input($$renderer) {
	let attrs;

	$$renderer.push(`<div${$.attributes({ b: true, c: true, d: true, ...attrs, a: true })}></div>`);
}