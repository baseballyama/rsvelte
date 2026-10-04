import * as $ from 'svelte/internal/server';

export default function Element_svg($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 10 10">`);
	$.element($$renderer, 'circle');
	$$renderer.push(`</svg>`);
}
