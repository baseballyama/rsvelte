import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<p>control</p> `);
	Widget($$renderer, {});
	$$renderer.push(`<!---->`);
}