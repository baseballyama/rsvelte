import * as $ from 'svelte/internal/server';
import * as FormPrimitive from 'formsnap';
import { cn } from '$lib/core/utils';

export default function Form_field_errors($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			errorClasses,
			children: childrenProp,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		{
			function children($$renderer, { errors, errorProps }) {
				if (childrenProp) {
					$$renderer.push('<!--[0-->');
					childrenProp($$renderer, { errors, errorProps });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><!--[-->`);

					const each_array = $.ensure_array_like(errors);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let error = each_array[$$index];

						$$renderer.push(`<div${$.attributes({ ...errorProps, class: $.clsx(cn(errorClasses)) })}>${$.escape(error)}</div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			}

			if (FormPrimitive.FieldErrors) {
				$$renderer.push('<!--[-->');

				FormPrimitive.FieldErrors($$renderer, $.spread_props([
					{
						class: cn('text-[0.8rem] font-medium text-destructive', className)
					},
					restProps,
					{ children, $$slots: { default: true } }
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$.bind_props($$props, { ref });
	});
}