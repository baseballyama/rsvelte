import * as $ from 'svelte/internal/server';
import DateInput from '$lib/DateInput.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let min = new Date(2024, 1, 26, 17, 30);
		let value = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DateInput($$renderer, {
				timePrecision: 'minute',
				min,
				isDisabledDate: (date) => {
					return date.getDate() === 15 || date.getDate() === 16;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <button>Set to 2024-10-15</button> ${$.escape(value)}`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}