import * as $ from 'svelte/internal/server';

export default function Index($$renderer) {
	const a = true;

	a === true;
	$$renderer.push(`<!---->true`);
}