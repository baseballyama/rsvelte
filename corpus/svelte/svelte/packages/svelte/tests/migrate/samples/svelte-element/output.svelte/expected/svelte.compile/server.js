import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$.element($$renderer, "div");
	$$renderer.push(` `);
	$.element($$renderer, 'div');
	$$renderer.push(` `);
	$.element($$renderer, "div");
	$$renderer.push(` `);
	$.element($$renderer, 'h');
}