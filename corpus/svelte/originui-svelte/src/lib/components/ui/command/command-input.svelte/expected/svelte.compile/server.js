import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import Search from '@lucide/svelte/icons/search';
import { Command as CommandPrimitive } from 'bits-ui';

export default function Command_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			value = '',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="border-input flex items-center border-b px-5" data-command-input-wrapper="">`);
			Search($$renderer, { size: 20, class: 'text-muted-foreground/80 me-3' });
			$$renderer.push(`<!----> `);

			if (CommandPrimitive.Input) {
				$$renderer.push('<!--[-->');

				CommandPrimitive.Input($$renderer, $.spread_props([
					{
						class: cn('placeholder:text-muted-foreground/70 flex h-10 w-full rounded-lg bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50', className)
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