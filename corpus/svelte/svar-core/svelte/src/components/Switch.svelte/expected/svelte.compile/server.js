import * as $ from 'svelte/internal/server';
import { getInputId } from "./helpers/getInputId.js";

export default function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id, value = false, disabled = false, css = "", onchange } = $$props;
		const inputId = getInputId(id);

		function onChange(event) {
			value = event.target.checked;
			onchange && onchange({ value });
		}

		$$renderer.push(`<label${$.attr_class(`wx-switch ${$.stringify(css)}`, 'svelte-136ytug')}><input type="checkbox"${$.attr('checked', value, true)}${$.attr('disabled', disabled, true)}${$.attr('id', inputId)} class="svelte-136ytug"/> <span class="svelte-136ytug"></span></label>`);
		$.bind_props($$props, { value });
	});
}