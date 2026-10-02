import * as $ from 'svelte/internal/server';

export default function Should_be_type01_input($$renderer) {
	$$renderer.push(`<a class="link">Click me!</a> <a class="link">Click me two!</a> <b class="bold">Text 1</b> <b class="bold" data-key="val">Text 2</b> <i id="italic">Italic</i>`);
}