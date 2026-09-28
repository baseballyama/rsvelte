import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let ignore = null;
	let handler = () => console.log("clicked");
	let bad = "invalid";

	$$renderer.push(`<button>click</button> <button>click</button> <button>click</button>`);
}