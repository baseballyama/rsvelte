import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer) {
	$$renderer.push(`<div class="foo"></div> <div class="bar"></div> <div class="bar">Children</div>`);
}