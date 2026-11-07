import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.select({ value: 'dog' }, ($$renderer) => {
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`--Please choose an option--`);
		});

		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`dog`);
		});

		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`cat`);
		});
	});
}