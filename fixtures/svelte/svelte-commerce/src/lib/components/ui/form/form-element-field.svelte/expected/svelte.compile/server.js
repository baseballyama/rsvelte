import * as $ from 'svelte/internal/server';
import * as FormPrimitive from 'formsnap';
import { cn } from '$lib/core/utils';

export default function Form_element_field($$renderer, $$props) {
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
				$$renderer.push(`<div${$.attributes({ class: $.clsx(cn('space-y-2', className)), ...restProps })}>`);
				childrenProp?.($$renderer, { constraints, errors, tainted, value });
				$$renderer.push(`<!----></div>`);
			}

			if (FormPrimitive.ElementField) {
				$$renderer.push('<!--[-->');
				FormPrimitive.ElementField($$renderer, { form, name, children, $$slots: { default: true } });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$.bind_props($$props, { ref });
	});
}