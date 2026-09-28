import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let handlers;
	let stopPropagation;
	let preventDefault;
	let stopImmediatePropagation;
	let once;
	let trusted;
	let self;
	let createBubbler;
	let bubble;
	let passive;
	let nonpassive;

	$$renderer.push(`<button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->click me`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div><button>click me</button> <button>click me</button> <button>click me</button></div>`);
}