import * as $ from 'svelte/internal/server';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { PincodeCheckRenderer, useProductState } from '$lib/core/composables/index.js';
import { MapPin } from '@lucide/svelte';

export default function Pincode_check($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pincode = void 0;
		const productState = useProductState();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content(
					$$renderer,
					{
						showPincode,
						loading,
						hasSingleWarehouse,
						selectedWarehouse,
						resultText,
						checkPincode,
						toggleShowPincode
					}
				) {
					if (!productState.warehouseLoaded) {
						$$renderer.push(`<!--[0--><div class="flex w-full justify-center">`);
						LoadingDots($$renderer, {});
						$$renderer.push(`<!----></div>`);
					} else if (!hasSingleWarehouse) {
						$$renderer.push('<!--[1-->');

						if (!showPincode) {
							$$renderer.push(`<!--[0--><div class="relative flex gap-2">`);

							Input($$renderer, {
								type: 'number',
								class: 'w-full rounded-md border-input bg-background p-2 [appearance:textfield] placeholder:text-muted-foreground/80 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
								placeholder: 'Enter Pincode',
								'aria-label': 'Enter Pincode',
								get value() {
									return pincode;
								},

								set value($$value) {
									pincode = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								disabled: !(pincode && pincode > 0) || loading,
								onclick: checkPincode,
								class: 'min-w-[80px]',
								children: ($$renderer) => {
									if (loading) {
										$$renderer.push('<!--[0-->');
										LoadingDots($$renderer, {});
									} else {
										$$renderer.push(`<!--[-1-->Check`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');

							Button($$renderer, {
								variant: 'plain',
								onclick: toggleShowPincode,
								class: 'flex min-h-[44px] items-center justify-start p-0 font-medium hover:bg-transparent',
								children: ($$renderer) => {
									$$renderer.push(`<span class="mr-2">Check Availability in your area</span> `);
									MapPin($$renderer, { class: 'size-4 text-primary' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (resultText) {
						$$renderer.push(`<!--[0--><div aria-live="polite" aria-atomic="true" class="min-h-[20px]">`);

						if (selectedWarehouse) {
							$$renderer.push(`<!--[0--><p class="mt-1 text-sm font-medium text-green-600 dark:text-green-400">Available in your area. Ships in ${$.escape(selectedWarehouse.leadTime)} business days</p>`);
						} else {
							$$renderer.push(`<!--[-1--><p class="mt-1 text-sm font-medium text-destructive">Sorry, we do not deliver to your area.</p>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				PincodeCheckRenderer($$renderer, {
					get pincode() {
						return pincode;
					},

					set pincode($$value) {
						pincode = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}