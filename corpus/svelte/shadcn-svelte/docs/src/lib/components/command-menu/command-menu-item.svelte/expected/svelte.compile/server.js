import * as $ from 'svelte/internal/server';
import * as Command from "$lib/registry/ui/command/index.js";
import { useMutationObserver } from "$lib/hooks/use-mutation-observer.svelte.js";
import { cn } from "$lib/utils.js";

export default function Command_menu_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			ref = null,
			class: className,
			onHighlight,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		useMutationObserver(
			() => ref,
			(mutations) => {
				for (const mutation of mutations) {
					if (mutation.type === "attributes" && mutation.attributeName === "aria-selected" && ref?.getAttribute("aria-selected") === "true") {
						onHighlight?.();
					}
				}
			},
			{ attributes: true }
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Command.Item) {
				$$renderer.push('<!--[-->');

				Command.Item($$renderer, $.spread_props([
					{
						class: cn("h-9 rounded-md border border-transparent !px-3 font-medium data-[selected=true]:border-input data-[selected=true]:bg-input/50", className)
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}