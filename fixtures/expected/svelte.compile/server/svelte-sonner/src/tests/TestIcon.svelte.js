import * as $ from 'svelte/internal/server';

export default function TestIcon($$renderer) {
	$$renderer.push(`<svg data-testid="custom-icon" viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="8"></circle></svg>`);
}