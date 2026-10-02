import * as $ from 'svelte/internal/server';
import DatePicker from '$lib/DatePicker.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<button>Set to precise value</button> `);

			DatePicker($$renderer, {
				timePrecision: 'minute',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(value?.toISOString() ?? 'null')}`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}