import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = 0;

	$$renderer.push(`<button>foo</button> <button>bar</button> <p>x: ${$.escape(x)}</p>`);
}