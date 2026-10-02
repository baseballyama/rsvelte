import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<!---->before <h1>after</h1>`);
}