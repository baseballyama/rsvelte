import * as $ from 'svelte/internal/server';
import { uid } from "@svar-ui/lib-dom";
import RadioButton from "./RadioButton.svelte";
import { setContext } from "svelte";

export default function RadioButtonGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { options = [{}], value = "", type = "", css = "", onchange } = $$props;

		setContext("wx-input-id", null);

		const name = uid();

		function handleChange(ev) {
			value = ev.inputValue;
			onchange && onchange({ value });
		}

		$$renderer.push(`<div${$.attr_class(`wx-radiogroup ${$.stringify(type && `wx-${type}`)} ${$.stringify(css)}`, 'svelte-l13ghu')}><!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.push(`<div class="wx-item svelte-l13ghu">`);

			RadioButton($$renderer, {
				label: option.label,
				inputValue: option.id,
				value: value === option.id,
				name,
				onchange: handleChange
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}