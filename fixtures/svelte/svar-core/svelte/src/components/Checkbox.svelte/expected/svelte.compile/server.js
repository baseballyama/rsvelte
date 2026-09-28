import * as $ from 'svelte/internal/server';
import { getInputId } from "./helpers/getInputId";

export default function Checkbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			label = "",
			inputValue = "",
			value = false,
			disabled = false,
			css = "",
			onchange
		} = $$props;

		const inputId = getInputId(id);

		function handlerChange({ target }) {
			value = target.checked;
			onchange && onchange({ value, inputValue });
		}

		$$renderer.push(`<div${$.attr_class(`wx-checkbox ${$.stringify(css)}`, 'svelte-1t6xk35')}><input type="checkbox"${$.attr('id', inputId)}${$.attr('disabled', disabled, true)}${$.attr('checked', value, true)}${$.attr('value', inputValue)} class="svelte-1t6xk35"/> <label${$.attr('for', inputId)} class="svelte-1t6xk35"><span class="svelte-1t6xk35"></span> `);

		if (label) {
			$$renderer.push(`<!--[0--><span class="svelte-1t6xk35">${$.escape(label)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label></div>`);
		$.bind_props($$props, { value });
	});
}