import * as $ from 'svelte/internal/server';
import Events from '../$$events/input.svelte';

export default function Input($$renderer) {
	Events($$renderer, {});
	$$renderer.push(`<!----> `);
	Events($$renderer, {});
	$$renderer.push(`<!---->`);
}