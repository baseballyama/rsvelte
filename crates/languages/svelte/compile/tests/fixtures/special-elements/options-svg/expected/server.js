import * as $ from 'svelte/internal/server';

export default function Options_svg($$renderer) {
	$$renderer.push(`<circle cx="10"></circle>`);
	$.element($$renderer, 'circle');
}
