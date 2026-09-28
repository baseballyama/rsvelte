import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';
import Textfield from '@smui/textfield';

export default function _Manual($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueStandard = void 0;
	let textStandard = '';
	let valueFilled = void 0;
	let textFilled = '';
	let valueOutlined = void 0;
	let textOutlined = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		Autocomplete($$renderer, {
			options: fruits,
			get value() {
				return valueStandard;
			},

			set value($$value) {
				valueStandard = $$value;
				$$settled = false;
			},

			get text() {
				return textStandard;
			},

			set text($$value) {
				textStandard = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Textfield($$renderer, {
					label: 'Fruit',
					get value() {
						return textStandard;
					},

					set value($$value) {
						textStandard = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueStandard || '')}</pre></div> <div>`);

		Autocomplete($$renderer, {
			options: fruits,
			get value() {
				return valueFilled;
			},

			set value($$value) {
				valueFilled = $$value;
				$$settled = false;
			},

			get text() {
				return textFilled;
			},

			set text($$value) {
				textFilled = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Textfield($$renderer, {
					label: 'Fruit',
					variant: 'filled',
					get value() {
						return textFilled;
					},

					set value($$value) {
						textFilled = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueFilled || '')}</pre></div> <div>`);

		Autocomplete($$renderer, {
			options: fruits,
			get value() {
				return valueOutlined;
			},

			set value($$value) {
				valueOutlined = $$value;
				$$settled = false;
			},

			get text() {
				return textOutlined;
			},

			set text($$value) {
				textOutlined = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Textfield($$renderer, {
					label: 'Fruit',
					variant: 'outlined',
					get value() {
						return textOutlined;
					},

					set value($$value) {
						textOutlined = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueOutlined || '')}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}