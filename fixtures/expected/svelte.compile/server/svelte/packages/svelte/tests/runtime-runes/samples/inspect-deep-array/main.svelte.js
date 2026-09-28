import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function createState(init) {
			let values = init;

			return {
				get value() {
					return $.snapshot(values);
				},

				get workedValues() {
					let newValue = [];

					for (const value of values) {
						if (value === undefined) {
							throw new Error('undefined found');
						}

						newValue.push(value);
					}

					return newValue;
				},

				doSplice() {
					values.splice(0, 1);
				}
			};
		}

		const myState = createState([1, 2, 3, 7]);

		;;
		$$renderer.push(`<button>Delete</button>`);
	});
}