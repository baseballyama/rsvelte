import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	console.log('script');
	$$renderer.push(`<p>three</p>`);
}