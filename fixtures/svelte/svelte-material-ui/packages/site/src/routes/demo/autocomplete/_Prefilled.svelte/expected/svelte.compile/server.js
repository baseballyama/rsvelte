import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';

export default function _Prefilled($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let value = 'Orange';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		Autocomplete($$renderer, {
			options: fruits,
			label: 'Fruit',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(value || '')}</pre></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}