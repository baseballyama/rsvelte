import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 0;
		const min = 2;
		const max = 5;

		function setValue() {
			if (value < min) {
				value = min;
			}

			if (value > max) {
				value = max;
			}
		}

		$$renderer.push(`<p>${$.escape(value)}</p> <input type="number"${$.attr('value', value)}/>`);
	});
}