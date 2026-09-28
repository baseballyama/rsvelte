import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div><p${$.attr_class('', void 0, { 'foo': true })}${$.attr_style('', { color: 'red' })}>This text should be red with a class of foo</p></div>`);
}