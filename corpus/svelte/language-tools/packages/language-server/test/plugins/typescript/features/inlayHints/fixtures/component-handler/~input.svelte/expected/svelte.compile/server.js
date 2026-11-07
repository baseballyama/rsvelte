import * as $ from 'svelte/internal/server';
import { SvelteComponentTyped } from 'svelte';

export default function Input($$renderer) {
	let Component;

	function log(message) {}

	Component($$renderer, {});
	$$renderer.push(`<!----> `);
	Component($$renderer, {});
	$$renderer.push(`<!---->`);
}