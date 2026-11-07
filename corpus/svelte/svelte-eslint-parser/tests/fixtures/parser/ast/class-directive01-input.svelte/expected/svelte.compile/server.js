import * as $ from 'svelte/internal/server';

export default function Class_directive01_input($$renderer) {
	let foo = false;
	let bar = false;

	$$renderer.push(`<div${$.attr_class('', void 0, { 'bar': bar })}></div> <div${$.attr_class('', void 0, { 'foo': foo })}></div>`);
}