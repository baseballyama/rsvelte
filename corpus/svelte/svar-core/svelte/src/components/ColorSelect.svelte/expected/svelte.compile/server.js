import * as $ from 'svelte/internal/server';
import Dropdown from "./Dropdown.svelte";
import { getInputId } from "./helpers/getInputId.js";

export default function ColorSelect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const defaultColors = [
			"#00a037",
			"#37a9ef",
			"#f5a623",
			"#ff4c3b",
			"#a0a0a0",
			"#000000",
			"#ffffff"
		];

		let {
			colors = defaultColors,
			value = "",
			id,
			clear = false,
			placeholder = "",
			title = "",
			tooltip,
			disabled = false,
			error = false,
			css = "",
			onchange,
			dropdown = {}
		} = $$props;

		const inputId = getInputId(id);
		let popup = false;

		function selectColor(ev, color) {
			ev.stopPropagation();
			value = color;
			popup = false;
			onchange && onchange({ value });
		}

		function unselectColor(ev) {
			ev.stopPropagation();
			value = "";
			onchange && onchange({ value });
		}

		function handlePopup() {
			if (disabled) return false;

			popup = true;
		}

		$$renderer.push(`<div${$.attr_class(`wx-colorselect ${$.stringify(css)}`, 'svelte-kv4v0t')}${$.attr('data-tooltip-text', tooltip)}><input${$.attr('title', title)}${$.attr('value', value)} readonly=""${$.attr('id', inputId)}${$.attr('placeholder', placeholder)}${$.attr('disabled', disabled, true)}${$.attr_class('svelte-kv4v0t', void 0, { 'wx-error': error, 'wx-focus': popup })}/> `);

		if (clear && value && !disabled) {
			$$renderer.push(`<!--[0--><i class="wx-clear wxi-close svelte-kv4v0t"></i>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (value) {
			$$renderer.push(`<!--[0--><div class="wx-color wx-selected svelte-kv4v0t"${$.attr_style(`background-color: ${$.stringify(value || '#00a037')}`)}></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="wx-empty wx-selected svelte-kv4v0t"></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (popup) {
			$$renderer.push('<!--[0-->');

			Dropdown($$renderer, $.spread_props([
				{ oncancel: () => popup = false },
				dropdown,
				{
					children: ($$renderer) => {
						$$renderer.push(`<div class="wx-colors svelte-kv4v0t"><div class="wx-empty svelte-kv4v0t"></div> <!--[-->`);

						const each_array = $.ensure_array_like(colors);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let color = each_array[$$index];

							$$renderer.push(`<div class="wx-color svelte-kv4v0t"${$.attr_style(`background-color: ${$.stringify(color)}`)}></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				}
			]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}