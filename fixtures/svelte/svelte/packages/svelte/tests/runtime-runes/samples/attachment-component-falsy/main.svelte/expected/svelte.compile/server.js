import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	function attachment() {
		console.log("up");
	}

	let enabled = false;

	$$renderer.push(`<button></button> `);
	Child($$renderer, {});
	$$renderer.push(`<!---->`);
}