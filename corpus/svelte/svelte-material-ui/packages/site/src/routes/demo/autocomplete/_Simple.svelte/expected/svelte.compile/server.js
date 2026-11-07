import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';

export default function _Simple($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueStandard = void 0;
	let valueFilled = void 0;
	let valueOutlined = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		Autocomplete($$renderer, {
			options: fruits,
			label: 'Standard',
			get value() {
				return valueStandard;
			},

			set value($$value) {
				valueStandard = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueStandard || '')}</pre></div> <div>`);

		Autocomplete($$renderer, {
			options: fruits,
			textfield$variant: 'filled',
			label: 'Filled',
			get value() {
				return valueFilled;
			},

			set value($$value) {
				valueFilled = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueFilled || '')}</pre></div> <div>`);

		Autocomplete($$renderer, {
			options: fruits,
			textfield$variant: 'outlined',
			label: 'Outlined',
			get value() {
				return valueOutlined;
			},

			set value($$value) {
				valueOutlined = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueOutlined || '')}</pre></div></div> <div>Disabled: <div class="columns margins"><div>`);
		Autocomplete($$renderer, { options: fruits, disabled: true, label: 'Standard' });
		$$renderer.push(`<!----></div> <div>`);

		Autocomplete($$renderer, {
			options: fruits,
			textfield$variant: 'filled',
			disabled: true,
			label: 'Filled'
		});

		$$renderer.push(`<!----></div> <div>`);

		Autocomplete($$renderer, {
			options: fruits,
			textfield$variant: 'outlined',
			disabled: true,
			label: 'Outlined'
		});

		$$renderer.push(`<!----></div></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}