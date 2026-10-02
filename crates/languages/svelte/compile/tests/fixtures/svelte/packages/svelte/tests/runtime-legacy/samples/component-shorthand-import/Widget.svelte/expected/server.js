import * as $ from 'svelte/internal/server';

export default function Widget($$renderer) {
	$$renderer.push(`<p>This is the widget.</p>`);
}