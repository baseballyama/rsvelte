import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div${$.attr_class('one', void 0, { 'two': true, 'three': true })}></div>`);
}