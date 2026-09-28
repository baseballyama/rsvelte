import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div style="color: red;"></div>`);
}