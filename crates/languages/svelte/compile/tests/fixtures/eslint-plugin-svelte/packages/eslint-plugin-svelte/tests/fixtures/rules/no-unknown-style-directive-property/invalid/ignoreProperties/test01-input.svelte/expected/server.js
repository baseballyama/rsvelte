import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let red = 'red';
	let unknown = red;
	let foo = red;
	let bar = red;

	$$renderer.push(`<div${$.attr_style('', { 'unknown-color': red })}>...</div> <div${$.attr_style('', { unknown })}>...</div> <div${$.attr_style('', { foo: red })}>...</div> <div${$.attr_style('', { foo })}>...</div> <div${$.attr_style('', { bar: red })}>...</div> <div${$.attr_style('', { bar })}>...</div> <div${$.attr_style('', { 'bar-foo': red })}>...</div> <div${$.attr_style('', { 'foo-bar': red })}>...</div>`);
}