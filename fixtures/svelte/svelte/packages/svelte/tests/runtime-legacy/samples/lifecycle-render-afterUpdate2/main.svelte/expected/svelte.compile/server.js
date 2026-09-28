import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer) {
	let a = 0;
	let b = 0;

	$$renderer.push(`<button>a: ${$.escape(a)}</button> <button>b: ${$.escape(b)}</button> `);
	Child($$renderer, { a, b });
	$$renderer.push(`<!---->`);
}