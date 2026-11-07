import * as $ from 'svelte/internal/server';

export default function Class01_input($$renderer) {
	$$renderer.push(`<a class="link svelte-18pnlon">Click me!</a> <span class="link svelte-18pnlon">Click me two!</span> <b class="bold svelte-18pnlon">Text 1</b> <strong class="bold svelte-18pnlon">Text 2</strong> <b data-key="val">Text 2</b> <b${$.attr_class('svelte-18pnlon', void 0, { 'conditional': true })}>Text 3</b>`);
}