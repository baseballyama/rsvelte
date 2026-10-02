import * as $ from 'svelte/internal/server';

export default function Duplicated_class_name_input($$renderer) {
	$$renderer.push(`<div class="div-class">Hello</div> <span class="div-class">World!</span>`);
}