import * as $ from 'svelte/internal/server';
import { getInputId } from "./helpers/getInputId.js";

export default function RadioButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			label = "",
			value = "",
			name = "",
			inputValue = "",
			disabled = false,
			css = "",
			onchange
		} = $$props;

		const inputId = getInputId(id);

		function handlerChange(ev) {
			value = ev.target.checked;

			if (value) onchange && onchange({ value: true, inputValue });
		}

		$$renderer.push(`<div${$.attr_class(`wx-radio ${$.stringify(css)}`, 'svelte-frw14h')}><input type="radio"${$.attr('id', inputId)}${$.attr('disabled', disabled, true)}${$.attr('name', name)}${$.attr('value', inputValue)}${$.attr('checked', value, true)} class="svelte-frw14h"/> <label${$.attr('for', inputId)} class="svelte-frw14h"><span class="svelte-frw14h"></span> `);

		if (label) {
			$$renderer.push(`<!--[0--><span class="svelte-frw14h">${$.escape(label)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label></div>`);
		$.bind_props($$props, { value });
	});
}