import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';

export default function Widget($$renderer) {
	$$renderer.push(`<button>click me</button> `);
	Inner($$renderer, {});
	$$renderer.push(`<!---->`);
}