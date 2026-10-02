import * as $ from 'svelte/internal/server';

export default function Should_be_id01_input($$renderer) {
	$$renderer.push(`<a class="link">Click me!</a> <a>Click me two!</a> <b class="bold">Text 1</b> <b data-key="val">Text 3</b>`);
}