import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function onclick(e) {
		// should log false when we click the span
		console.log(e.currentTarget === e.target);
	}

	$$renderer.push(`<button><span>Click me</span></button>`);
}