import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo = 'bar';
	let spread = { class: 'bar', foo: 'bar' };

	$$renderer.push(`<div${$.attr_class(foo)}${$.attr('foo', foo)}></div> <div${$.attributes({ ...spread })}></div>`);
}