import * as $ from 'svelte/internal/server';

export default function Inner($$renderer) {
	$$renderer.push(`<!---->Inner`);
}