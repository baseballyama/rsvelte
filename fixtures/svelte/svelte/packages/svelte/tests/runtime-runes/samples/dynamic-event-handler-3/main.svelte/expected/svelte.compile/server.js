import * as $ from 'svelte/internal/server';
import Button from './Button.svelte';

export default function Main($$renderer) {
	let count = 0;
	let d = 1;

	function create_handler() {
		const change = d;

		console.log(`creating handler (${change})`);

		return function increment() {
			count += change;
			console.log(count);
		};
	}

	$$renderer.push(`<button>increase d (${$.escape(d)})</button> <button>clicks: ${$.escape(count)}</button> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->clicks: ${$.escape(count)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}