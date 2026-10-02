import * as $ from 'svelte/internal/server';
import ValueComponent from './ValueComponent.svelte';

export default function Input($$renderer) {
	let value = "test";

	ValueComponent($$renderer, { value, defaultValue: "foo" });
	$$renderer.push(`<!----> `);
	ValueComponent($$renderer, { value, defaultValue: 1 });
	$$renderer.push(`<!---->`);
}