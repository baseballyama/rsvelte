import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.element($$renderer, 'div');
	$$renderer.push(` `);
	$.element($$renderer, 'div');
	$$renderer.push(` `);
	$.element($$renderer, "div");
	$$renderer.push(` `);
	$.element($$renderer, 'h');
}