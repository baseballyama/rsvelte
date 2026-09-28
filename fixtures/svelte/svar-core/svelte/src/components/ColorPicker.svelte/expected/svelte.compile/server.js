import * as $ from 'svelte/internal/server';
import Dropdown from "./Dropdown.svelte";
import ColorBoard from "./ColorBoard.svelte";
import { getInputId } from "./helpers/getInputId.js";

export default function ColorPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			id,
			placeholder = "",
			title = "",
			tooltip,
			disabled = false,
			error = false,
			clear = false,
			css = "",
			onchange,
			dropdown = {}
		} = $$props;

		const inputId = getInputId(id);
		let popup = false;

		function handlePopup() {
			if (disabled) return false;

			popup = true;
		}

		function selectColor(ev) {
			if (ev.input) return;

			popup = false;
			value = ev.value;
			onchange && onchange({ value });
		}

		function unselectColor(ev) {
			ev.stopPropagation();
			value = "";
			onchange && onchange({ value });
		}

		$$renderer.push(`<div${$.attr_class(`wx-colorpicker ${$.stringify(css)}`, 'svelte-1h4catv')}${$.attr('data-tooltip-text', tooltip)}><input${$.attr('title', title)}${$.attr('value', value)} readonly=""${$.attr('id', inputId)}${$.attr('placeholder', placeholder)}${$.attr('disabled', disabled, true)}${$.attr_class('svelte-1h4catv', void 0, { 'wx-error': error, 'wx-focus': popup })}/> <div class="wx-color svelte-1h4catv"${$.attr_style(`background: ${$.stringify(value)}`)}></div> `);

		if (clear && !disabled && value) {
			$$renderer.push(`<!--[0--><i class="wxi-close svelte-1h4catv"></i>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (popup) {
			$$renderer.push('<!--[0-->');

			Dropdown($$renderer, $.spread_props([
				{ oncancel: () => popup = false },
				dropdown,
				{
					children: ($$renderer) => {
						ColorBoard($$renderer, { value, button: 'true', onchange: selectColor });
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