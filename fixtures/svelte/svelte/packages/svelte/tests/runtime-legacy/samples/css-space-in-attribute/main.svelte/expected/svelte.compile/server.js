import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<p class="foo bar">control</p> `);
	Widget($$renderer, {});
	$$renderer.push(`<!---->`);
}