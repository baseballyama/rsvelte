import * as $ from 'svelte/internal/server';
import SelectScrollDownButton from './select-scroll-down-button.svelte';
import SelectScrollUpButton from './select-scroll-up-button.svelte';
import { cn } from '$lib/utils.js';
import { Select as SelectPrimitive } from 'bits-ui';

export default function Select_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			portalProps,
			ref = null,
			sideOffset = 4,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SelectPrimitive.Portal) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.Portal($$renderer, $.spread_props([
					portalProps,
					{
						children: ($$renderer) => {
							if (SelectPrimitive.Content) {
								$$renderer.push('<!--[-->');

								SelectPrimitive.Content($$renderer, $.spread_props([
									{
										sideOffset,
										class: cn('border-input bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[min(24rem,var(--bits-select-content-available-height))] min-w-(--bits-select-anchor-width,8rem) overflow-hidden rounded-lg border shadow-lg shadow-black/5 [&_[role=group]]:py-1', className)
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
											SelectScrollUpButton($$renderer, {});
											$$renderer.push(`<!----> `);

											if (SelectPrimitive.Viewport) {
												$$renderer.push('<!--[-->');

												SelectPrimitive.Viewport($$renderer, {
													class: cn('p1 h-(--bits-select-anchor-height) p-1'),
													children: ($$renderer) => {
														children?.($$renderer);
														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											SelectScrollDownButton($$renderer, {});
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