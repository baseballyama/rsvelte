import * as $ from 'svelte/internal/server';

export default function Class01_input($$renderer) {
	$$renderer.push(`<a class="link svelte-1mhiyzt">Click me!</a> <a class="link svelte-1mhiyzt">Click me two!</a> <a>Click me three!</a> <b class="bold svelte-1mhiyzt">Text 1</b> <b class="bold svelte-1mhiyzt">Text 2</b> <b data-key="val">Text 3</b> <b${$.attr_class('svelte-1mhiyzt', void 0, { 'conditional': true })}>Text 4</b> <b class="conditional-two svelte-1mhiyzt">Text 5</b> <b${$.attr_class('svelte-1mhiyzt', void 0, { 'conditional-two': true })}>Text 6</b>`);
}