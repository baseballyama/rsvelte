import * as $ from 'svelte/internal/server';
import clsx from "clsx";

export default function SidebarGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className = "space-y-2",
			borderClass = "pt-4 mt-4 border-t border-gray-200 dark:border-gray-700",
			border = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<ul${$.attributes({
			...restProps,
			class: $.clsx(border ? clsx(borderClass) : clsx(className))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></ul>`);
	});
}