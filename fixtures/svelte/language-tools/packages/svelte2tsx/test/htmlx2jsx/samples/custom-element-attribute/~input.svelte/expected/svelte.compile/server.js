import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<custom-element camelcase="true" kebab-case="true" pascalcase="true" snake_case="true"></custom-element>`);
}