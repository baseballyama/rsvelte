import * as $ from 'svelte/internal/server';
import { Dialog as SheetPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import SheetOverlay from "./sheet-overlay.svelte";
import SheetPortal from "./sheet-portal.svelte";

export default function Sheet_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			side = "right",
			showCloseButton = true,
			portalProps,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SheetPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						SheetOverlay($$renderer, {});
						$$renderer.push(`<!----> `);

						if (SheetPrimitive.Content) {
							$$renderer.push('<!--[-->');

							SheetPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'sheet-content',
									'data-side': side,
									class: cn("cn-sheet-content data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10", className)
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
										$$renderer.push(`<!----> `);

										if (showCloseButton) {
											$$renderer.push('<!--[0-->');

											{
												function child($$renderer, { props }) {
													Button($$renderer, $.spread_props([
														{ variant: 'ghost', class: 'cn-sheet-close', size: 'icon-sm' },
														props,
														{
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'XIcon',
																	tabler: 'IconX',
																	hugeicons: 'Cancel01Icon',
																	phosphor: 'XIcon',
																	remixicon: 'RiCloseLine'
																});

																$$renderer.push(`<!----> <span class="sr-only">Close</span>`);
															},
															$$slots: { default: true }
														}
													]));
												}

												if (SheetPrimitive.Close) {
													$$renderer.push('<!--[-->');
													SheetPrimitive.Close($$renderer, { 'data-slot': 'sheet-close', child, $$slots: { child: true } });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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