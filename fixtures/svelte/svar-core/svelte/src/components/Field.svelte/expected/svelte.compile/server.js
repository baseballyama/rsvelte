import * as $ from 'svelte/internal/server';
import { uid } from "@svar-ui/lib-dom";
import { setContext } from "svelte";

export default function Field($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			label = "",
			position = "",
			width = "",
			error = false,
			type = "",
			required = false,
			id,
			css = "",
			children
		} = $$props;

		const inputId = id === undefined ? uid() : id;

		setContext("wx-input-id", inputId);
		$$renderer.push(`<div${$.attr_class(`wx-field wx-${$.stringify(position)} ${$.stringify(css)}`, 'svelte-rvw8fk', { 'wx-error': error, 'wx-required': required })}${$.attr_style(width ? `width: ${width}` : "")}>`);

		if (label) {
			$$renderer.push('<!--[0-->');

			if (inputId) {
				$$renderer.push(`<!--[0--><label class="wx-label svelte-rvw8fk"${$.attr('for', inputId)}>${$.escape(label)}</label>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="wx-label svelte-rvw8fk">${$.escape(label)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class(`wx-field-control wx-${$.stringify(type)}`, 'svelte-rvw8fk')}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}