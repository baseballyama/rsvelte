import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let numbers = { a: 1, b: 2, c: 3 };

	$$renderer.push(`<button>set</button> <button>delete</button> <p>${$.escape(Object.keys(numbers))}</p> <p>${$.escape(JSON.stringify(numbers))}</p>`);
}