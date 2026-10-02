import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<p>This prerendered page only imports env.js when the app uses a public dynamic environment variable</p>`);
}