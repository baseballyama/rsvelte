import * as $ from 'svelte/internal/server';

export default function Fix_missing_function_element($$renderer) {
	$$renderer.push(`<button></button>`);
}