import * as $ from 'svelte/internal/server';

export default function Global01_input($$renderer) {
	$$renderer.push(`<a id="link">Click me!</a> <a>Click me two!</a> <b id="bold">Text 1</b> <b>Text 2</b> <b data-key="val">Text 2</b>`);
}