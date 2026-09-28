import * as $ from 'svelte/internal/server';
import Select, { Option } from '@smui/select';
import Icon from '@smui/select/icon';

export default function _ShapedOutlined($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let value = '';
	let valueHelperText = '';
	let valueLeadingIcon = '';
	let valueInvalid = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins svelte-yfbnvz"><div class="svelte-yfbnvz">`);

		Select($$renderer, {
			class: 'shaped-outlined',
			variant: 'outlined',
			label: 'Fruit',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
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

		$$renderer.push(`<!----> <pre class="status svelte-yfbnvz">Selected: ${$.escape(value)}</pre></div> <div class="svelte-yfbnvz">`);

		{
			function helperText($$renderer) {
				$$renderer.push(`<!---->Helper text.`);
			}

			Select($$renderer, {
				class: 'shaped-outlined',
				variant: 'outlined',
				label: 'With Helper Text',
				get value() {
					return valueHelperText;
				},

				set value($$value) {
					valueHelperText = $$value;
					$$settled = false;
				},
				helperText,
				children: ($$renderer) => {
					Option($$renderer, { value: '' });
					$$renderer.push(`<!----> <!--[-->`);

					const each_array_1 = $.ensure_array_like(fruits);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let fruit = each_array_1[$$index_1];

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
				$$slots: { helperText: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status svelte-yfbnvz">Selected: ${$.escape(valueHelperText)}</pre></div> <div class="svelte-yfbnvz">`);

		{
			function leadingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->event`);
					},
					$$slots: { default: true }
				});
			}

			Select($$renderer, {
				class: 'shaped-outlined',
				variant: 'outlined',
				label: 'Leading Icon',
				get value() {
					return valueLeadingIcon;
				},

				set value($$value) {
					valueLeadingIcon = $$value;
					$$settled = false;
				},
				leadingIcon,
				children: ($$renderer) => {
					Option($$renderer, { value: '' });
					$$renderer.push(`<!----> <!--[-->`);

					const each_array_2 = $.ensure_array_like(fruits);

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let fruit = each_array_2[$$index_2];

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
				$$slots: { leadingIcon: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status svelte-yfbnvz">Selected: ${$.escape(valueLeadingIcon)}</pre></div> <div class="svelte-yfbnvz">`);

		Select($$renderer, {
			class: 'shaped-outlined',
			variant: 'outlined',
			invalid: true,
			label: 'Invalid',
			get value() {
				return valueInvalid;
			},

			set value($$value) {
				valueInvalid = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Option($$renderer, { value: '' });
				$$renderer.push(`<!----> <!--[-->`);

				const each_array_3 = $.ensure_array_like(fruits);

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let fruit = each_array_3[$$index_3];

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

		$$renderer.push(`<!----> <pre class="status svelte-yfbnvz">Selected: ${$.escape(valueInvalid)}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}