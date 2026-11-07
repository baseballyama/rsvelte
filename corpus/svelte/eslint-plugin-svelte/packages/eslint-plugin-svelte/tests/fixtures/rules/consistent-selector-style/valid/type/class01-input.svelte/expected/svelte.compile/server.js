import * as $ from 'svelte/internal/server';

export default function Class01_input($$renderer) {
	$$renderer.push(`<a class="link svelte-3b4sig">Click me!</a> <a class="link svelte-3b4sig">Click me two!</a> <a>Click me three!</a> <a class="unique svelte-3b4sig">Click me three!</a> <b class="bold svelte-3b4sig">Text 1</b> <b class="bold svelte-3b4sig">Text 2</b> <b data-key="val">Text 3</b> <b${$.attr_class('svelte-3b4sig', void 0, { 'conditional': true })}>Text 4</b>`);
}