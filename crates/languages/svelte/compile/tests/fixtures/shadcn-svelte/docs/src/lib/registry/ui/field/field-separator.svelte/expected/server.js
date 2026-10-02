import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/registry/ui/separator/index.js";
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
			class: $.clsx(cn("cn-field-separator relative", className)),
			...restProps
		})}>`);

		Separator($$renderer, { class: 'absolute inset-0 top-1/2' });
		$$renderer.push(`<!----> `);

		if (children) {
			$$renderer.push(`<!--[0--><span class="cn-field-separator-content relative mx-auto block w-fit bg-background" data-slot="field-separator-content">`);
			children($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}