import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/components/ui/separator/index.js";
import { cn } from "$lib/utils.js";

export default function Field_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const hasContent = $.derived(() => !!children);

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'field-separator',
			'data-content': hasContent(),
			class: $.clsx(cn("relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2", className)),
			...restProps
		})}>`);

		Separator($$renderer, { class: 'absolute inset-0 top-1/2' });
		$$renderer.push(`<!----> `);

		if (children) {
			$$renderer.push(`<!--[0--><span class="bg-background text-muted-foreground relative mx-auto block w-fit px-2" data-slot="field-separator-content">`);
			children($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}