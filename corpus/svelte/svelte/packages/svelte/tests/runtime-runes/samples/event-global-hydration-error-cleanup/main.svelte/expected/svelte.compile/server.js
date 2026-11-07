import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p>${$.html('<p>invalid</p>')}</p>`);
}