import * as $ from 'svelte/internal/server';
import Check from "phosphor-svelte/lib/Check";
import CopySimple from "phosphor-svelte/lib/CopySimple";
import { cn } from "$lib/utils/styles.js";

export default function Copy_code_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			copyCode,
			copied = false,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<button${$.attributes({
			class: $.clsx(cn("text-muted-foreground hover:bg-muted focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2", className)),
			'aria-label': 'Copy',
			...rest,
			'data-copy-code': true
		})}>`);

		if (copied) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'h-5 w-5' });
		} else {
			$$renderer.push('<!--[-1-->');
			CopySimple($$renderer, { class: 'h-5 w-5' });
		}

		$$renderer.push(`<!--]--></button>`);
	});
}