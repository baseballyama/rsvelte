import * as $ from 'svelte/internal/server';

export default function Ignore_no_order_with_spread_test_input($$renderer) {
	let attrs;

	$$renderer.push(`<div${$.attributes({ 'order-b': true, ...attrs, 'order-c': true, 'order-a': true })}></div> <div${$.attributes({ a: true, b: true, ...attrs, c: true })}></div> <div${$.attributes({ c: true, ...attrs, b: true, a: true })}></div> <div${$.attributes({
		h: true,
		g: true,
		f: true,
		e: true,
		'order-b': true,
		d: true,
		...attrs,
		c: true,
		'order-c': true,
		b: true,
		'order-a': true,
		a: true
	})}></div>`);
}