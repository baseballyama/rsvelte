import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Steps($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn("relative mb-12 ml-4 border-l border-border [counter-reset:step]", className)))}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}