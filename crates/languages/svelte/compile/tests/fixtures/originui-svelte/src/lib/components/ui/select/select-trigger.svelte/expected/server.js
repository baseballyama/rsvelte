import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import { Select as SelectPrimitive } from 'bits-ui';

export default function Select_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SelectPrimitive.Trigger) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.Trigger($$renderer, $.spread_props([
					{
						class: cn('border-input bg-background text-foreground focus:border-ring focus:ring-ring/20 data-placeholder:text-muted-foreground/70 flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start text-sm shadow-xs shadow-black/5 focus:ring-[3px] focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&>span]:min-w-0', className)
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
							$$renderer.push(`<span class="pointer-events-none">`);
							children?.($$renderer);
							$$renderer.push(`<!----></span> `);
							ChevronDown($$renderer, { size: 16, class: 'text-muted-foreground/80 shrink-0' });
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