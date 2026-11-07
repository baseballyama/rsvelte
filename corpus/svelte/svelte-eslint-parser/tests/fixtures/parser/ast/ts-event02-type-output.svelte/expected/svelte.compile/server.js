import * as $ from 'svelte/internal/server';
import Component from 'foo.svelte';

export default function Ts_event02_type_output($$renderer) {
	$$renderer.push(`<button></button> `);
	Component($$renderer, {});
	$$renderer.push(`<!---->`);
	// Component: LegacyComponentType
}