import * as $ from 'svelte/internal/server';
import { getInputId } from "./helpers/getInputId.js";

export default function TextArea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			id,
			placeholder = "",
			title = "",
			tooltip,
			disabled = false,
			error = false,
			readonly = false,
			css = "",
			onchange
		} = $$props;

		const inputId = getInputId(id);

		$$renderer.push(`<textarea${$.attr_class(`wx-textarea ${$.stringify(css)}`, 'svelte-vseiui', { 'wx-error': error })}${$.attr('id', inputId)}${$.attr('disabled', disabled, true)}${$.attr('placeholder', placeholder)}${$.attr('readonly', readonly, true)}${$.attr('title', title)}${$.attr('data-tooltip-text', tooltip)}>`);

		const $$body = $.escape(value);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea>`);
		$.bind_props($$props, { value });
	});
}