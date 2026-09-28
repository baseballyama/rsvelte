import * as $ from 'svelte/internal/server';
import { Switch } from "bits-ui";
import { cn } from "$lib/utils/styles.js";

export default function Preview_switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			checked = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Switch.Root) {
				$$renderer.push('<!--[-->');

				Switch.Root($$renderer, $.spread_props([
					{
						class: cn("focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary/60 focus-visible:ring-offset-background shadow-xs focus-visible:outline-hidden peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)
					},
					restProps,
					{
						get checked() {
							return checked;
						},

						set checked($$value) {
							checked = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Switch.Thumb) {
								$$renderer.push('<!--[-->');

								Switch.Thumb($$renderer, {
									class: cn("data-[state=checked]:bg-background data-[state=unchecked]:bg-accent pointer-events-none relative inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 transition-all ease-in-out data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0")
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
		$.bind_props($$props, { checked });
	});
}