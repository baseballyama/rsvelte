import * as $ from 'svelte/internal/server';
import * as FormPrimitive from "formsnap";
import { cn } from "$lib/utils.js";

export default function Form_field($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			form,
			name,
			children: childrenProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		{
			function children($$renderer, { constraints, errors, tainted, value }) {
				$$renderer.push(`<div${$.attributes({
					'data-slot': 'form-item',
					class: $.clsx(cn("space-y-2", className)),
					...restProps
				})}>`);

				childrenProp?.($$renderer, { constraints, errors, tainted, value });
				$$renderer.push(`<!----></div>`);
			}

			if (FormPrimitive.Field) {
				$$renderer.push('<!--[-->');
				FormPrimitive.Field($$renderer, { form, name, children, $$slots: { default: true } });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$.bind_props($$props, { ref });
	});
}