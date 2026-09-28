import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let items = [];

	$$renderer.push(`<button>Add</button> ${$.escape(JSON.stringify(items.sort()))}`);
}