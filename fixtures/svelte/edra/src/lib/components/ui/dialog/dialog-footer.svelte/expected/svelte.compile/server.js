import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Dialog as DialogPrimitive } from 'bits-ui';
import { Button } from '$lib/components/ui/button/index.js';

export default function Dialog_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			showCloseButton = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'dialog-footer',
			class: $.clsx(cn('-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----> `);

		if (showCloseButton) {
			$$renderer.push('<!--[0-->');

			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Close`);
							},
							$$slots: { default: true }
						}
					]));
				}

				if (DialogPrimitive.Close) {
					$$renderer.push('<!--[-->');
					DialogPrimitive.Close($$renderer, { child, $$slots: { child: true } });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}