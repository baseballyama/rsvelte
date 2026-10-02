import * as $ from 'svelte/internal/server';
import Component from 'foo.svelte';

export default function Ts_event02_input($$renderer) {
	$$renderer.push(`<button></button> `);
	Component($$renderer, {});
	$$renderer.push(`<!---->`);
}