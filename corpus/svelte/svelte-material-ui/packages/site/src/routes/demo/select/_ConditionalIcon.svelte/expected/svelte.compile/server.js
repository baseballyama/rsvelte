import * as $ from 'svelte/internal/server';
import Select, { Option } from '@smui/select';
import Icon from '@smui/select/icon';
import Button from '@smui/button';

export default function _ConditionalIcon($$renderer) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueA = '';
	let valueB = '';
	let valueC = '';
	let showLeadingIcons = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		{
			function leadingIcon($$renderer) {
				if (showLeadingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->event`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Select($$renderer, {
				withLeadingIcon: showLeadingIcons,
				label: 'Standard',
				get value() {
					return valueA;
				},

				set value($$value) {
					valueA = $$value;
					$$settled = false;
				},
				leadingIcon,
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
				$$slots: { leadingIcon: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueA)}</pre></div> <div>`);

		{
			function leadingIcon($$renderer) {
				if (showLeadingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->event`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Select($$renderer, {
				withLeadingIcon: showLeadingIcons,
				variant: 'filled',
				label: 'Filled',
				get value() {
					return valueB;
				},

				set value($$value) {
					valueB = $$value;
					$$settled = false;
				},
				leadingIcon,
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
				$$slots: { leadingIcon: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueB)}</pre></div> <div>`);

		{
			function leadingIcon($$renderer) {
				if (showLeadingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->event`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Select($$renderer, {
				withLeadingIcon: showLeadingIcons,
				variant: 'outlined',
				label: 'Outlined',
				get value() {
					return valueC;
				},

				set value($$value) {
					valueC = $$value;
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

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(valueC)}</pre></div></div> <div>`);

		Button($$renderer, {
			onclick: () => showLeadingIcons = !showLeadingIcons,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle Leading Icons`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}