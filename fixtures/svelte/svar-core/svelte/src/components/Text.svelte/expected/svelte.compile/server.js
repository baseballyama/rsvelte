import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { getInputId } from "./helpers/getInputId.js";

export default function Text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			id,
			readonly = false,
			focus = false,
			select = false,
			type = "text",
			placeholder = "",
			disabled = false,
			error = false,
			title = "",
			tooltip,
			css = "",
			icon = "",
			clear = false,
			onchange
		} = $$props;

		const inputId = getInputId(id);
		let cssString = $.derived(() => icon && css.indexOf("wx-icon-left") === -1 ? "wx-icon-right " + css : css);
		let hasLeftIcon = $.derived(() => icon && css.indexOf("wx-icon-left") !== -1);

		// svelte-ignore non_reactive_update
		let input;

		onMount(() => {
			// wait till the source click processing will end
			setTimeout(
				() => {
					if (focus && input) input.focus();
					if (select && input) input.select();
				},
				1
			);
		});

		const oninput = () => onchange && onchange({ value, input: true });
		const change = () => onchange && onchange({ value });

		function clearValue(ev) {
			ev.stopPropagation();
			value = "";
			onchange && onchange({ value });
		}

		$$renderer.push(`<div${$.attr_class(`wx-text ${$.stringify(cssString())}`, 'svelte-rzzsv7', {
			'wx-error': error,
			'wx-disabled': disabled,
			'wx-clear': clear
		})}${$.attr('data-tooltip-text', tooltip)}>`);

		if (type == "password") {
			$$renderer.push(`<!--[0--><input${$.attr('value', value)}${$.attr('id', inputId)}${$.attr('readonly', readonly, true)}${$.attr('disabled', disabled, true)}${$.attr('placeholder', placeholder)} type="password"${$.attr('title', title)} class="svelte-rzzsv7"/>`);
		} else if (type == "number") {
			$$renderer.push(`<!--[1--><input${$.attr('value', value)}${$.attr('id', inputId)}${$.attr('readonly', readonly, true)}${$.attr('disabled', disabled, true)}${$.attr('placeholder', placeholder)} type="number"${$.attr('title', title)} class="svelte-rzzsv7"/>`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attr('value', value)}${$.attr('id', inputId)}${$.attr('readonly', readonly, true)}${$.attr('disabled', disabled, true)}${$.attr('placeholder', placeholder)}${$.attr('title', title)} class="svelte-rzzsv7"/>`);
		}

		$$renderer.push(`<!--]--> `);

		if (clear && !disabled && value) {
			$$renderer.push(`<!--[0--><i class="wx-icon wxi-close svelte-rzzsv7"></i> `);

			if (hasLeftIcon()) {
				$$renderer.push(`<!--[0--><i${$.attr_class(`wx-icon ${$.stringify(icon)}`, 'svelte-rzzsv7')}></i>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else if (icon) {
			$$renderer.push(`<!--[1--><i${$.attr_class(`wx-icon ${$.stringify(icon)}`, 'svelte-rzzsv7')}></i>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}