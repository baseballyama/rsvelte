import * as $ from 'svelte/internal/server';

export default function Options_mathml($$renderer) {
	$$renderer.push(`<mi>x</mi>`);
	$.element($$renderer, 'mi');
}
