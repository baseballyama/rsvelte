import * as $ from 'svelte/internal/server';

export default function Spread_test01_output($$renderer) {
	let attrs;

	$$renderer.push(`<div${$.attributes({ c: true, d: true, ...attrs, a: true, b: true })}></div>`);
}