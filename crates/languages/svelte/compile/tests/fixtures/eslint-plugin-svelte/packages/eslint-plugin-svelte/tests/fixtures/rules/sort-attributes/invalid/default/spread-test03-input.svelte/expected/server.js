import * as $ from 'svelte/internal/server';

export default function Spread_test03_input($$renderer) {
	let attrs;
	let attrs2;

	$$renderer.push(`<div${$.attributes({
		f: true,
		e: true,
		...attrs,
		d: true,
		c: true,
		...attrs2,
		b: true,
		a: true
	})}></div>`);
}