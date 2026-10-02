import * as $ from 'svelte/internal/server';

export default function Spread_test03_output($$renderer) {
	let attrs;
	let attrs2;

	$$renderer.push(`<div${$.attributes({
		e: true,
		f: true,
		...attrs,
		c: true,
		d: true,
		...attrs2,
		a: true,
		b: true
	})}></div>`);
}