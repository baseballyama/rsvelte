import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Pre($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<pre${$.attributes({
			class: $.clsx(cn("rounded-card border-muted relative mb-4 mt-6 overflow-x-auto border-2 py-8", className)),
			...restProps
		})}>
	`);

		children?.($$renderer);

		$$renderer.push(`<!---->
</pre>`);
	});
}