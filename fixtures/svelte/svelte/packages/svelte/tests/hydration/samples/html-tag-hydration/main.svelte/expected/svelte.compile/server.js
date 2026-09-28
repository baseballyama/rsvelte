import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const a = 1;
	const b = 2;
	const c = 3;

	$$renderer.push(`<!---->1 ${$.html(b)} 3`);
}