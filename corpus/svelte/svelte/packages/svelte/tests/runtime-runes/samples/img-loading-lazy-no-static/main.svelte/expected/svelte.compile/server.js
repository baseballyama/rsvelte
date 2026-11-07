import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<h1></h1> <img src="..." loading="lazy"/>`);
}