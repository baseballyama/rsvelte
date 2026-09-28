import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let name = 'world';
	const foo = world;

	$$renderer.push(`<!---->Usage when no explicit runes/legacy mode should be ok`);
}