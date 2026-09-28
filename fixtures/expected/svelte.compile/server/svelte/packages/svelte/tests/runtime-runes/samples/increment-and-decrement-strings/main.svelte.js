import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let a = "0";
	let b = "0";
	let c = "0";
	let d = "0";

	function update() {
		// @ts-expect-error
		console.log(a++);

		// @ts-expect-error
		console.log(b--);

		// @ts-expect-error
		console.log(++c);

		// @ts-expect-error
		console.log(--d);
	}

	$$renderer.push(`<button>update</button> <p>${$.escape(a)}, ${$.escape(b)}, ${$.escape(c)}, ${$.escape(d)}</p>`);
}