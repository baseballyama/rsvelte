import * as $ from 'svelte/internal/server';

export default function Class01_input($$renderer) {
	$$renderer.push(`<a class="link svelte-155xx9s">Click me!</a> <a class="link svelte-155xx9s">Click me two!</a> <a>Click me three!</a> <b class="bold svelte-155xx9s">Text 1</b> <b class="bold svelte-155xx9s">Text 2</b> <b data-key="val">Text 3</b> <b${$.attr_class('svelte-155xx9s', void 0, { 'conditinal': true })}>Text 4</b>`);
}