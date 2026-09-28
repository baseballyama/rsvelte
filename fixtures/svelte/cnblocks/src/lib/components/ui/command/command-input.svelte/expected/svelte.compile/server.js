import * as $ from 'svelte/internal/server';
import { Command as CommandPrimitive } from "bits-ui";
import Search from "@lucide/svelte/icons/search";
import { cn } from "$lib/utils.js";

export default function Command_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			value = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex items-center border-b px-3" data-command-input-wrapper="">`);
			Search($$renderer, { class: 'mr-2 size-4 shrink-0 opacity-50' });
			$$renderer.push(`<!----> `);

			if (CommandPrimitive.Input) {
				$$renderer.push('<!--[-->');

				CommandPrimitive.Input($$renderer, $.spread_props([
					{
						class: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)
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

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, value });
	});
}