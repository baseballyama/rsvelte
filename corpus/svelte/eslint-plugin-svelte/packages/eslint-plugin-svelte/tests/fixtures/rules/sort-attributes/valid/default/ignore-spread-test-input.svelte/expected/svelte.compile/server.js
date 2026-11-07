import * as $ from 'svelte/internal/server';

export default function Ignore_spread_test_input($$renderer) {
	let a;
	let b;
	let attrs;

	$$renderer.push(`<div${$.attributes({ id: 'foo', ...attrs, class: 'foo' })}></div> <div${$.attributes({ ...attrs, id: 'foo', class: 'foo' })}></div> <div${$.attributes({ id: 'foo', class: 'foo', ...attrs })}></div>`);
}