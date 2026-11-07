import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';

export default function _FullWidth($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let value = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		Autocomplete($$renderer, {
			options: fruits,
			label: 'Fruit',
			style: 'width: 100%;',
			textfield$style: 'width: 100%;',
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