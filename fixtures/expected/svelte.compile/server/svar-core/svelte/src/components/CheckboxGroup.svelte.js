import * as $ from 'svelte/internal/server';
import Checkbox from "./Checkbox.svelte";
import { setContext } from "svelte";

export default function CheckboxGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { options = [], value = [], type = "", css = "", onchange } = $$props;

		setContext("wx-input-id", null);

		function handleChange(obj) {
			if (obj.value) value = [...value, obj.inputValue]; else value = value.filter((a) => a != obj.inputValue);

			onchange && onchange({ value });
		}

		$$renderer.push(`<div${$.attr_class(`wx-checkboxgroup ${$.stringify(type && `wx-${type}`)} ${$.stringify(css)}`, 'svelte-1577ppk')}><!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.push(`<div class="wx-item svelte-1577ppk">`);

			Checkbox($$renderer, {
				label: option.label,
				inputValue: option.id,
				value: value.includes(option.id),
				onchange: handleChange
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}