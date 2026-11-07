import * as $ from 'svelte/internal/server';
import { getInputId } from "./helpers/getInputId.js";

export default function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			options = [],
			placeholder = "",
			title = "",
			tooltip,
			disabled = false,
			error = false,
			textField = "label",
			clear = false,
			id,
			css = "",
			onchange
		} = $$props;

		const inputId = getInputId(id);

		function unselect() {
			value = "";
			onchange && onchange({ value });
		}

		function handleChange() {
			onchange && onchange({ value });
		}

		$$renderer.push(`<div${$.attr_class(`wx-select ${$.stringify(css)}`, 'svelte-1oopn40')}${$.attr('data-tooltip-text', tooltip)}>`);

		$$renderer.select(
			{
				id: inputId,
				value,
				disabled,
				title,
				onchange: handleChange,
				class: ''
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(options);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let option = each_array[$$index];

					$$renderer.option(
						{ value: option.id, class: '' },
						($$renderer) => {
							$$renderer.push(`${$.escape(option[textField])}`);
						},
						'svelte-1oopn40'
					);
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-1oopn40',
			{ 'wx-error': error }
		);

		$$renderer.push(` `);

		if (!value && value !== 0) {
			$$renderer.push(`<!--[0--><div class="wx-placeholder svelte-1oopn40">${$.escape(placeholder)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (clear && !disabled && value) {
			$$renderer.push(`<!--[0--><i class="wx-icon wxi-close svelte-1oopn40"></i>`);
		} else {
			$$renderer.push(`<!--[-1--><i class="wx-icon wxi-angle-down svelte-1oopn40"></i>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}