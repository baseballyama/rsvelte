import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p>before</p> <p>after</p>`);
}