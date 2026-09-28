import * as $ from 'svelte/internal/server';
import List from "./helpers/SuggestDropdown.svelte";
import { getInputId } from "./helpers/getInputId.js";

export default function MultiCombo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			value = [],
			options = [],
			textOptions = null,
			textField = "label",
			keepText = false,
			placeholder = "",
			title = "",
			tooltip,
			disabled = false,
			error = false,
			checkboxes = false,
			css = "",
			onchange,
			children,
			dropdown = {}
		} = $$props;

		const inputId = getInputId(id);
		let text = "";

		let selected = $.derived(() => value
			? (textOptions || options).filter((i) => value.includes(i.id))
			: []);

		let filterOptions = $.derived(() => {
			const o = options;

			return text
				? o.filter((i) => i[textField].toLowerCase().includes(text.toLowerCase()))
				: o;
		});

		let focus = false;
		let inputElement = void 0;
		let navigate = null;
		let keydown = null;

		function onready(ev) {
			navigate = ev.navigate;
			keydown = ev.keydown;
		}

		function input() {
			if (filterOptions().length) navigate(0); else navigate(null);
		}

		function onselect(ev) {
			const { id } = ev;

			if (id) {
				value = id;

				if (!keepText) text = "";

				onchange && onchange({ value: id });
				inputElement.focus();
			}
		}

		function remove(id, ev) {
			if (ev) ev.stopPropagation();

			value = value.filter((i) => i !== id);
			onchange && onchange({ value });
		}

		const index = () => value && value.length
			? filterOptions().findIndex((i) => i.id === value[0])
			: 0;

		function onclick() {
			if (!disabled) {
				inputElement.focus();
				navigate(index());
			}
		}

		$$renderer.push(`<div${$.attr('title', title)}${$.attr_class(`wx-multicombo ${$.stringify(css)}`, 'svelte-k28o9d', {
			'wx-error': error,
			'wx-disabled': disabled,
			'wx-not-empty': selected().length,
			'wx-focus': focus && !disabled
		})}${$.attr('data-tooltip-text', tooltip)}><div class="wx-wrapper svelte-k28o9d"><div class="wx-tags svelte-k28o9d"><!--[-->`);

		const each_array = $.ensure_array_like(selected());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tag = each_array[$$index];

			$$renderer.push(`<div class="wx-tag svelte-k28o9d">`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { option: tag });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(tag[textField])}`);
			}

			$$renderer.push(`<!--]--> `);

			if (!disabled) {
				$$renderer.push(`<!--[0--><i class="wx-icon wxi-close svelte-k28o9d"></i>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="wx-select svelte-k28o9d"><input${$.attr('id', inputId)} type="text"${$.attr('value', text)}${$.attr('placeholder', placeholder)}${$.attr('disabled', disabled, true)} class="svelte-k28o9d"/> <i class="wx-icon wxi-angle-down svelte-k28o9d"></i></div></div> `);

		if (!disabled) {
			$$renderer.push('<!--[0-->');

			{
				function children($$renderer, { option }) {
					if (children) {
						$$renderer.push('<!--[0-->');
						children($$renderer, { option });
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(option[textField])}`);
					}

					$$renderer.push(`<!--]-->`);
				}

				List($$renderer, $.spread_props([
					{
						items: filterOptions(),
						multiselect: true,
						onready,
						onselect,
						checkboxes,
						value
					},
					dropdown,
					{ children, $$slots: { default: true } }
				]));
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}