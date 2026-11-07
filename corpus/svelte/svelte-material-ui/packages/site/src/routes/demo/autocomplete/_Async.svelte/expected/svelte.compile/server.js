import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';
import { Text } from '@smui/list';
import CircularProgress from '@smui/circular-progress';

export default function _Async($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let fruits = [
			'Apple',
			'Orange',
			'Banana',
			'Mango',
			'Lemon',
			'Cherry',
			'Blueberry',
			'Grape',
			'Strawberry'
		];

		let value = void 0;
		let counter = 0;

		async function searchItems(input) {
			if (input === '') {
				return [];
			}

			if (value != null) {
				// Return an array with just the already selected value to hide the menu.
				// As soon as the user changes the text field, the value is unselected, so
				// the search should run again.
				return [value];
			}

			// Pretend to have some sort of canceling mechanism.
			const myCounter = ++counter;

			// Pretend to be loading something...
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// This means the function was called again, so we should cancel.
			if (myCounter !== counter) {
				// `return false` (or, more accurately, resolving the Promise object to
				// `false`) is how you tell Autocomplete to cancel this search. It won't
				// replace the results of any subsequent search that has already finished.
				return false;
			}

			// Return a list of matches.
			return fruits.filter((item) => item.toLowerCase().includes(input.toLowerCase()));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div>`);

			{
				function loading($$renderer) {
					Text($$renderer, {
						style: 'display: flex; width: 100%; justify-content: center; align-items: center;',
						children: ($$renderer) => {
							CircularProgress($$renderer, { style: 'height: 24px; width: 24px;', indeterminate: true });
						},
						$$slots: { default: true }
					});
				}

				Autocomplete($$renderer, {
					search: searchItems,
					showMenuWithNoInput: false,
					label: 'Fruit',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},
					loading,
					$$slots: { loading: true }
				});
			}

			$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(value || '')}</pre></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}