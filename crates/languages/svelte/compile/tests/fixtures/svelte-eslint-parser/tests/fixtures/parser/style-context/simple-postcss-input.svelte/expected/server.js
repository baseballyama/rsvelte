import * as $ from 'svelte/internal/server';

export default function Simple_postcss_input($$renderer) {
	$$renderer.push(`<div class="container"><div class="div-class">Hello</div> <span class="span-class">World!</span></div>`);
}