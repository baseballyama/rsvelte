import * as $ from 'svelte/internal/server';

export default function Chain01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let foo;

		const remove1 = () => {
			foo?.remove();
		};

		const remove2 = () => {
			(foo?.remove)();
		};

		$$renderer.push(`<p>div</p> <button>Click Me</button> <button>Click Me</button>`);
	});
}