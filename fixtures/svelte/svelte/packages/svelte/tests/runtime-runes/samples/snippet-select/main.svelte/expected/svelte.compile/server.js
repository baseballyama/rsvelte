import * as $ from 'svelte/internal/server';
import Select from './Select.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<div><label for="pet-select">Choose a pet 1:</label> `);

	Select($$renderer, {
		children: ($$renderer) => {
			$$renderer.option({ value: '' }, ($$renderer) => {
				$$renderer.push(`--Please choose an option--`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 'dog' }, ($$renderer) => {
				$$renderer.push(`Dog`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: 'cat' }, ($$renderer) => {
				$$renderer.push(`Cat`);
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><label for="pet-select">Choose a pet 2:</label> <select name="pets" id="pet-select2">`);

	$$renderer.option({ value: '' }, ($$renderer) => {
		$$renderer.push(`--Please choose an option--`);
	});

	$$renderer.option({ value: 'dog' }, ($$renderer) => {
		$$renderer.push(`Dog`);
	});

	$$renderer.option({ value: 'cat' }, ($$renderer) => {
		$$renderer.push(`Cat`);
	});

	$$renderer.push(`</select></div>`);
}