import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from 'bits-ui';
import SelectPortal from './select-portal.svelte';
import SelectScrollUpButton from './select-scroll-up-button.svelte';
import SelectScrollDownButton from './select-scroll-down-button.svelte';
import { cn } from '$lib/utils.js';

export default function Select_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			sideOffset = 4,
			portalProps,
			children,
			preventScroll = true,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SelectPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						if (SelectPrimitive.Content) {
							$$renderer.push('<!--[-->');

							SelectPrimitive.Content($$renderer, $.spread_props([
								{
									sideOffset,
									preventScroll,
									'data-slot': 'select-content',
									class: cn('bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 relative isolate z-50 min-w-36 overflow-x-hidden overflow-y-auto rounded-md shadow-md ring-1 duration-100', className)
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
												class: cn('h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) scroll-my-1'),
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