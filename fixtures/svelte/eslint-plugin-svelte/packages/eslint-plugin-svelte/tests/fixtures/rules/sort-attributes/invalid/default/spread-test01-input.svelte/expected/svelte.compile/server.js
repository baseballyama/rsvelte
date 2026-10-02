import * as $ from 'svelte/internal/server';

export default function Spread_test01_input($$renderer) {
	let attrs;

	$$renderer.push(`<div${$.attributes({ d: true, c: true, ...attrs, b: true, a: true })}></div>`);
}