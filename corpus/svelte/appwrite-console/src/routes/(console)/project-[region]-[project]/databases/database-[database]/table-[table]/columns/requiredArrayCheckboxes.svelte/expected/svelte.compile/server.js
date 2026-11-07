import * as $ from 'svelte/internal/server';
import { Selector, Tooltip } from '@appwrite.io/pink-svelte';

export default function RequiredArrayCheckboxes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			required = false,
			array = false,
			editing = false,
			disabled = false
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Tooltip($$renderer, {
				disabled: !array || disabled,
				maxWidth: '275px',
				placement: 'bottom-start',
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_style('', { width: 'fit-content' })}>`);

					if (Selector.Checkbox) {
						$$renderer.push('<!--[-->');

						Selector.Checkbox($$renderer, {
							size: 's',
							id: 'required',
							label: 'Required',
							disabled: array || disabled,
							description: 'Indicate whether this column is required.',
							get checked() {
								return required;
							},

							set checked($$value) {
								required = $$value;
								$$settled = false;
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				},

				$$slots: {
					default: true,
					tooltip: ($$renderer) => {
						{
							$$renderer.push(`Required cannot be selected because array columns may contain more than one value.`);
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				disabled: !(required || editing) || disabled,
				maxWidth: '275px',
				placement: 'bottom-start',
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_style('', { width: 'fit-content' })}>`);

					if (Selector.Checkbox) {
						$$renderer.push('<!--[-->');

						Selector.Checkbox($$renderer, {
							size: 's',
							id: 'array',
							label: 'Array',
							disabled: required || editing || disabled,
							description: 'Indicate whether this column is an array. Defaults to an empty array.',
							get checked() {
								return array;
							},

							set checked($$value) {
								array = $$value;
								$$settled = false;
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				},

				$$slots: {
					default: true,
					tooltip: ($$renderer) => {
						{
							if (editing) {
								$$renderer.push(`<!--[0-->Array cannot be selected to avoid data incompatibility.`);
							} else {
								$$renderer.push(`<!--[-1-->Array cannot be selected because required columns must be populated in all rows with a
            single value.`);
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { required, array });
	});
}