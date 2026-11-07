import * as $ from 'svelte/internal/server';

export default function _error($$renderer) {
	$$renderer.push(`<p>This is your custom error page.</p>`);
}