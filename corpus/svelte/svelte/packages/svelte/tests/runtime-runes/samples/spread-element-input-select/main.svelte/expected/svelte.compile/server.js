import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { value = "Hello", spread = { disabled: false } } = $$props;

	$$renderer.push(`<button></button> `);

	$$renderer.select({ value, ...spread }, ($$renderer) => {
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`Hello`);
		});

		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`World`);
		});
	});
}