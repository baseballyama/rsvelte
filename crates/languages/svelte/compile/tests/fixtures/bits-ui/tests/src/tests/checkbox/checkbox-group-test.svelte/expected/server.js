import * as $ from 'svelte/internal/server';
import { Checkbox } from "bits-ui";

export default function Checkbox_group_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value: valueProp = [],
			items = [],
			disabledItems = [],
			readonlyItems = [],
			type,
			onFormSubmit,
			getValue: getValueProp,
			setValue: setValueProp,
			$$slots,
			$$events,
			...restProps

			/**
			 * The individual checkbox items.
			 */
		} = $$props;

		let myValue = valueProp;

		function MyCheckbox($$renderer, { itemValue }) {
			{
				function children($$renderer, { checked, indeterminate }) {
					$$renderer.push(`<span${$.attr('data-testid', `${$.stringify(itemValue)}-indicator`)}>`);

					if (indeterminate) {
						$$renderer.push(`<!--[0-->indeterminate`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(checked)}`);
					}

					$$renderer.push(`<!--]--></span>`);
				}

				if (Checkbox.Root) {
					$$renderer.push('<!--[-->');

					Checkbox.Root($$renderer, {
						'data-testid': `${$.stringify(itemValue)}-checkbox`,
						value: itemValue,
						disabled: disabledItems?.includes(itemValue),
						readonly: readonlyItems?.includes(itemValue),
						type,
						children,
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => {
				getValueProp?.();

				return myValue;
			};

			var bind_set = (v) => {
				setValueProp?.(v);
				myValue = v;
			};

			$$renderer.push(`<main><form method="POST"><p data-testid="binding">${$.escape(myValue)}</p> `);

			if (Checkbox.Group) {
				$$renderer.push('<!--[-->');

				Checkbox.Group($$renderer, $.spread_props([
					{
						'data-testid': 'group',
						get value() {
							return bind_get();
						},

						set value($$value) {
							bind_set($$value);
						}
					},
					restProps,
					{
						children: ($$renderer) => {
							if (Checkbox.GroupLabel) {
								$$renderer.push('<!--[-->');

								Checkbox.GroupLabel($$renderer, {
									'data-testid': 'group-label',
									children: ($$renderer) => {
										$$renderer.push(`<!---->My Group`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <!--[-->`);

							const each_array = $.ensure_array_like(items);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let itemValue = each_array[$$index];

								MyCheckbox($$renderer, { itemValue });
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <button type="submit" data-testid="submit">Submit</button></form> <button data-testid="update">Programmatic update</button></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value: valueProp });
	});
}