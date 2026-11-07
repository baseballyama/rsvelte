import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Field_error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			errors,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const hasContent = $.derived(() => {
			// has slotted error
			if (children) return true;

			// no errors
			if (!errors || errors.length === 0) return false;

			// has an error but no message
			if (errors.length === 1 && !errors[0]?.message) {
				return false;
			}

			return true;
		});

		const isMultipleErrors = $.derived(() => errors && errors.length > 1);
		const singleErrorMessage = $.derived(() => errors && errors.length === 1 && errors[0]?.message);

		if (hasContent()) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				role: 'alert',
				'data-slot': 'field-error',
				class: $.clsx(cn('text-destructive text-sm font-normal', className)),
				...restProps
			})}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else if (singleErrorMessage()) {
				$$renderer.push(`<!--[1-->${$.escape(singleErrorMessage())}`);
			} else if (isMultipleErrors()) {
				$$renderer.push(`<!--[2--><ul class="ml-4 flex list-disc flex-col gap-1"><!--[-->`);

				const each_array = $.ensure_array_like(errors ?? []);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let error = each_array[index];

					if (error?.message) {
						$$renderer.push(`<!--[0--><li>${$.escape(error.message)}</li>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}