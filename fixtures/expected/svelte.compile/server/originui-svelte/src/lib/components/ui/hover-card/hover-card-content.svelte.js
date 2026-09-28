import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { LinkPreview as HoverCardPrimitive } from 'bits-ui';

export default function Hover_card_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			align = 'center',
			children,
			class: className,
			portalProps,
			ref = null,
			showArrow = false,
			sideOffset = 4,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (HoverCardPrimitive.Portal) {
				$$renderer.push('<!--[-->');

				HoverCardPrimitive.Portal($$renderer, $.spread_props([
					portalProps,
					{
						children: ($$renderer) => {
							if (HoverCardPrimitive.Content) {
								$$renderer.push('<!--[-->');

								HoverCardPrimitive.Content($$renderer, $.spread_props([
									{
										sideOffset,
										align,
										class: cn('border-border bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-lg border p-4 shadow-lg shadow-black/5 outline-hidden', className)
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
											children($$renderer);
											$$renderer.push(`<!----> `);

											if (showArrow) {
												$$renderer.push('<!--[0-->');

												if (HoverCardPrimitive.Arrow) {
													$$renderer.push('<!--[-->');

													HoverCardPrimitive.Arrow($$renderer, {
														class: 'text-popover -my-px drop-shadow-[0_1px_0_hsl(var(--border))]'
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									}
								]));

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
		$.bind_props($$props, { ref });
	});
}