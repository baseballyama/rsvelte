import * as $ from 'svelte/internal/server';

export default function Class01_input($$renderer) {
	$$renderer.push(`<a class="link svelte-zna95z">Click me!</a> <a class="bold svelte-zna95z">Click me two!</a> <b class="bold svelte-zna95z">Text 1</b> <b class="link svelte-zna95z">Text 2</b> <b data-key="val">Text 3</b> <b${$.attr_class('svelte-zna95z', void 0, { 'conditional': true })}>Text 4</b>`);
}