import * as $ from 'svelte/internal/server';

export default function Imported($$renderer) {
	$$renderer.push(`<p>hi</p>`);
}