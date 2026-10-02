import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div is="custom-element" camelcase="true" kebab-case="true" pascalcase="true" snake_case="true"></div>`);
}