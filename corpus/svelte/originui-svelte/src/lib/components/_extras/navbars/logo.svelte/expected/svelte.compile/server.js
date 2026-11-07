import * as $ from 'svelte/internal/server';

export default function Logo($$renderer) {
	$$renderer.push(`<svg class="stroke-svelte size-6" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke-width="2"></circle><circle cx="16" cy="16" r="9" fill="none" stroke-width="2"></circle></svg> <span class="sr-only">Origin UI - Svelte</span>`);
}