import * as $ from 'svelte/internal/server';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import * as Tabs from '$lib/components/ui/tabs/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { Ruler, X } from '@lucide/svelte';
import { fly } from 'svelte/transition';

export default function Size_guide_drawer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false } = $$props;
		let innerWidth = 0;

		// US ring sizes with circumference and diameter (mm) — standard Zales chart
		const ringSizes = [
			{ size: '3', circumference: 44.2, diameter: 14.1 },
			{ size: '3.5', circumference: 45.5, diameter: 14.5 },
			{ size: '4', circumference: 46.8, diameter: 14.9 },
			{ size: '4.5', circumference: 48.0, diameter: 15.3 },
			{ size: '5', circumference: 49.3, diameter: 15.7 },
			{ size: '5.5', circumference: 50.6, diameter: 16.1 },
			{ size: '6', circumference: 51.9, diameter: 16.5 },
			{ size: '6.5', circumference: 53.1, diameter: 16.9 },
			{ size: '7', circumference: 54.4, diameter: 17.3 },
			{ size: '7.5', circumference: 55.7, diameter: 17.7 },
			{ size: '8', circumference: 57.0, diameter: 18.1 },
			{ size: '8.5', circumference: 58.3, diameter: 18.5 },
			{ size: '9', circumference: 59.5, diameter: 19.0 },
			{ size: '9.5', circumference: 60.8, diameter: 19.4 },
			{ size: '10', circumference: 62.1, diameter: 19.8 },
			{ size: '10.5', circumference: 63.4, diameter: 20.2 },
			{ size: '11', circumference: 64.6, diameter: 20.6 },
			{ size: '11.5', circumference: 65.9, diameter: 21.0 },
			{ size: '12', circumference: 67.2, diameter: 21.4 },
			{ size: '12.5', circumference: 68.5, diameter: 21.8 },
			{ size: '13', circumference: 69.7, diameter: 22.2 }
		];

		const measureSteps = [
			'Wrap a piece of non-stretchy string, ribbon or a thin strip of paper snugly around the base of your finger.',
			'Mark the point where the string overlaps with a pen.',
			'Lay the string flat against a ruler and measure the length in millimetres — this is your finger circumference.',
			'Find that measurement in the Circumference column of the chart to read off your ring size.'
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Drawer.Root) {
				$$renderer.push('<!--[-->');

				Drawer.Root($$renderer, {
					direction: innerWidth > 400 ? 'right' : 'bottom',
					shouldScaleBackground: true,
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Drawer.Trigger) {
							$$renderer.push('<!--[-->');

							Drawer.Trigger($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm font-medium text-primary underline-offset-4 hover:underline inline-flex items-center gap-1 edp-sizeguide">`);
									Ruler($$renderer, { class: 'h-3.5 w-3.5' });
									$$renderer.push(`<!----> Size Guide</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Drawer.Content) {
							$$renderer.push('<!--[-->');

							Drawer.Content($$renderer, {
								class: 'sm:left-auto sm:right-0 sm:top-0 sm:mt-0 sm:h-screen sm:w-fit sm:max-w-md [&>div:first-child]:hidden',
								children: ($$renderer) => {
									$$renderer.push(`<div class="mx-auto w-full max-w-md pb-8 sm:pb-0 sm:h-screen sm:flex sm:flex-col">`);

									if (Drawer.Header) {
										$$renderer.push('<!--[-->');

										Drawer.Header($$renderer, {
											class: 'text-left',
											children: ($$renderer) => {
												if (Drawer.Title) {
													$$renderer.push('<!--[-->');

													Drawer.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Ring Size Guide`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Drawer.Description) {
													$$renderer.push('<!--[-->');

													Drawer.Description($$renderer, {
														class: 'text-sm text-muted-foreground',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Find your perfect fit using the chart below or measure at home.`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Drawer.Close) {
													$$renderer.push('<!--[-->');

													Drawer.Close($$renderer, {
														class: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
														children: ($$renderer) => {
															X($$renderer, { class: 'h-4 w-4' });
															$$renderer.push(`<!----> <span class="sr-only">Close</span>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tabs.Root) {
										$$renderer.push('<!--[-->');

										Tabs.Root($$renderer, {
											value: 'chart',
											class: 'flex flex-1 flex-col overflow-hidden px-4',
											children: ($$renderer) => {
												if (Tabs.List) {
													$$renderer.push('<!--[-->');

													Tabs.List($$renderer, {
														class: 'grid w-full grid-cols-2 rounded-md bg-muted p-1',
														children: ($$renderer) => {
															if (Tabs.Trigger) {
																$$renderer.push('<!--[-->');

																Tabs.Trigger($$renderer, {
																	value: 'chart',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Size Chart`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Tabs.Trigger) {
																$$renderer.push('<!--[-->');

																Tabs.Trigger($$renderer, {
																	value: 'measure',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->How to Measure`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Tabs.Content) {
													$$renderer.push('<!--[-->');

													Tabs.Content($$renderer, {
														value: 'chart',
														class: 'mt-4 flex-1 overflow-y-auto pb-4',
														children: ($$renderer) => {
															$$renderer.push(`<div class="overflow-hidden rounded-lg border"><table class="w-full text-sm"><thead class="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th class="px-4 py-3 text-left font-semibold">US Size</th><th class="px-4 py-3 text-right font-semibold">Circumference (mm)</th><th class="px-4 py-3 text-right font-semibold">Diameter (mm)</th></tr></thead><tbody><!--[-->`);

															const each_array = $.ensure_array_like(ringSizes);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let row = each_array[$$index];

																$$renderer.push(`<tr class="border-t transition-colors hover:bg-muted/40"><td class="px-4 py-2.5 font-medium text-foreground">${$.escape(row.size)}</td><td class="px-4 py-2.5 text-right tabular-nums text-muted-foreground">${$.escape(row.circumference.toFixed(1))}</td><td class="px-4 py-2.5 text-right tabular-nums text-muted-foreground">${$.escape(row.diameter.toFixed(1))}</td></tr>`);
															}

															$$renderer.push(`<!--]--></tbody></table></div> <p class="mt-3 text-xs text-muted-foreground">Sizes shown in US standard. If you are between sizes, we recommend choosing the larger size.</p>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Tabs.Content) {
													$$renderer.push('<!--[-->');

													Tabs.Content($$renderer, {
														value: 'measure',
														class: 'mt-4 flex-1 overflow-y-auto pb-4',
														children: ($$renderer) => {
															$$renderer.push(`<ol class="space-y-4"><!--[-->`);

															const each_array_1 = $.ensure_array_like(measureSteps);

															for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																let step = each_array_1[i];

																$$renderer.push(`<li class="flex gap-3"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">${$.escape(i + 1)}</span> <span class="text-sm leading-relaxed text-foreground">${$.escape(step)}</span></li>`);
															}

															$$renderer.push(`<!--]--></ol> <div class="mt-6 rounded-lg border bg-muted/40 p-4"><p class="text-sm font-semibold text-foreground">Tips for an accurate measurement</p> <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground"><li>Measure at the end of the day when fingers are at their largest.</li> <li>Avoid measuring when your hands are cold.</li> <li>Measure the finger you intend to wear the ring on.</li></ul></div>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

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
		$.bind_props($$props, { open });
	});
}