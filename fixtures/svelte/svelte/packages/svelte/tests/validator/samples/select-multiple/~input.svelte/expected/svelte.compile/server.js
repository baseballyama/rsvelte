import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let value;

	$$renderer.select({ value, multiple: true }, ($$renderer) => {
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`1`);
		});
	});
}