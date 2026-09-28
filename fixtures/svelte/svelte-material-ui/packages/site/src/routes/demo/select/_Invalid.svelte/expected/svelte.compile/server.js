import * as $ from 'svelte/internal/server';
import Select, { Option } from '@smui/select';
import FormField from '@smui/form-field';
import Checkbox from '@smui/checkbox';

export default function _Invalid($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueA = '';
	let invalidA = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		Select($$renderer, {
			label: 'Fruit',
			invalid: invalidA,
			updateInvalid: false,
			get value() {
				return valueA;
			},

			set value($$value) {
				valueA = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Option($$renderer, { value: '' });
				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(fruits);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let fruit = each_array[$$index];

					Option($$renderer, {
						value: fruit,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(fruit)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div style="margin-top: 1em;">`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Invalid`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return invalidA;
						},

						set checked($$value) {
							invalidA = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <pre class="status">Selected: ${$.escape(valueA)}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}