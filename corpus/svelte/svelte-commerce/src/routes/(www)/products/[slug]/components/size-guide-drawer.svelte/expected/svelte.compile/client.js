import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import * as Tabs from '$lib/components/ui/tabs/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { Ruler, X } from '@lucide/svelte';
import { fly } from 'svelte/transition';

var root = $.from_html(`<span class="text-sm font-medium text-primary underline-offset-4 hover:underline inline-flex items-center gap-1 edp-sizeguide"><!> Size Guide</span>`);
var root_1 = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<tr class="border-t transition-colors hover:bg-muted/40"><td class="px-4 py-2.5 font-medium text-foreground"> </td><td class="px-4 py-2.5 text-right tabular-nums text-muted-foreground"> </td><td class="px-4 py-2.5 text-right tabular-nums text-muted-foreground"> </td></tr>`);
var root_5 = $.from_html(`<div class="overflow-hidden rounded-lg border"><table class="w-full text-sm"><thead class="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th class="px-4 py-3 text-left font-semibold">US Size</th><th class="px-4 py-3 text-right font-semibold">Circumference (mm)</th><th class="px-4 py-3 text-right font-semibold">Diameter (mm)</th></tr></thead><tbody></tbody></table></div> <p class="mt-3 text-xs text-muted-foreground">Sizes shown in US standard. If you are between sizes, we recommend choosing the larger size.</p>`, 1);
var root_6 = $.from_html(`<li class="flex gap-3"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"></span> <span class="text-sm leading-relaxed text-foreground"> </span></li>`);
var root_7 = $.from_html(`<ol class="space-y-4"></ol> <div class="mt-6 rounded-lg border bg-muted/40 p-4"><p class="text-sm font-semibold text-foreground">Tips for an accurate measurement</p> <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground"><li>Measure at the end of the day when fingers are at their largest.</li> <li>Avoid measuring when your hands are cold.</li> <li>Measure the finger you intend to wear the ring on.</li></ul></div>`, 1);
var root_8 = $.from_html(`<div class="mx-auto w-full max-w-md pb-8 sm:pb-0 sm:h-screen sm:flex sm:flex-col"><!> <!></div>`);

export default function Size_guide_drawer($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false);
	let innerWidth = $.state(0);

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(innerWidth) > 400 ? 'right' : 'bottom');

		$.component(node, () => Drawer.Root, ($$anchor, Drawer_Root) => {
			Drawer_Root($$anchor, {
				get direction() {
					return $.get($0);
				},
				shouldScaleBackground: true,
				get open() {
					return open();
				},

				set open($$value) {
					open($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_3();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
						Drawer_Trigger($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var span = root();
								var node_2 = $.child(span);

								Ruler(node_2, { class: 'h-3.5 w-3.5' });
								$.next();
								$.reset(span);
								$.append($$anchor, span);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_1, 2);

					$.component(node_3, () => Drawer.Content, ($$anchor, Drawer_Content) => {
						Drawer_Content($$anchor, {
							class: 'sm:left-auto sm:right-0 sm:top-0 sm:mt-0 sm:h-screen sm:w-fit sm:max-w-md [&>div:first-child]:hidden',
							children: ($$anchor, $$slotProps) => {
								var div = root_8();
								var node_4 = $.child(div);

								$.component(node_4, () => Drawer.Header, ($$anchor, Drawer_Header) => {
									Drawer_Header($$anchor, {
										class: 'text-left',
										children: ($$anchor, $$slotProps) => {
											var fragment_2 = root_2();
											var node_5 = $.first_child(fragment_2);

											$.component(node_5, () => Drawer.Title, ($$anchor, Drawer_Title) => {
												Drawer_Title($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Ring Size Guide');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Drawer.Description, ($$anchor, Drawer_Description) => {
												Drawer_Description($$anchor, {
													class: 'text-sm text-muted-foreground',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Find your perfect fit using the chart below or measure at home.');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_6, 2);

											$.component(node_7, () => Drawer.Close, ($$anchor, Drawer_Close) => {
												Drawer_Close($$anchor, {
													class: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
													children: ($$anchor, $$slotProps) => {
														var fragment_3 = root_1();
														var node_8 = $.first_child(fragment_3);

														X(node_8, { class: 'h-4 w-4' });
														$.next(2);
														$.append($$anchor, fragment_3);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_2);
										},
										$$slots: { default: true }
									});
								});

								var node_9 = $.sibling(node_4, 2);

								$.component(node_9, () => Tabs.Root, ($$anchor, Tabs_Root) => {
									Tabs_Root($$anchor, {
										value: 'chart',
										class: 'flex flex-1 flex-col overflow-hidden px-4',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_2();
											var node_10 = $.first_child(fragment_4);

											$.component(node_10, () => Tabs.List, ($$anchor, Tabs_List) => {
												Tabs_List($$anchor, {
													class: 'grid w-full grid-cols-2 rounded-md bg-muted p-1',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_3();
														var node_11 = $.first_child(fragment_5);

														$.component(node_11, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
															Tabs_Trigger($$anchor, {
																value: 'chart',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Size Chart');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});

														var node_12 = $.sibling(node_11, 2);

														$.component(node_12, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
															Tabs_Trigger_1($$anchor, {
																value: 'measure',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('How to Measure');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											var node_13 = $.sibling(node_10, 2);

											$.component(node_13, () => Tabs.Content, ($$anchor, Tabs_Content) => {
												Tabs_Content($$anchor, {
													value: 'chart',
													class: 'mt-4 flex-1 overflow-y-auto pb-4',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_5();
														var div_1 = $.first_child(fragment_6);
														var table = $.child(div_1);
														var tbody = $.sibling($.child(table));

														$.each(tbody, 21, () => ringSizes, $.index, ($$anchor, row) => {
															var tr = root_4();
															var td = $.child(tr);
															var text_4 = $.only_child(td, true);
															var td_1 = $.sibling(td);
															var text_5 = $.only_child(td_1, true);
															var td_2 = $.sibling(td_1);
															var text_6 = $.only_child(td_2, true);

															$.reset(tr);

															$.template_effect(
																($0, $1) => {
																	$.set_text(text_4, $.get(row).size);
																	$.set_text(text_5, $0);
																	$.set_text(text_6, $1);
																},
																[
																	() => $.get(row).circumference.toFixed(1),
																	() => $.get(row).diameter.toFixed(1)
																]
															);

															$.append($$anchor, tr);
														});

														$.reset(tbody);
														$.reset(table);
														$.reset(div_1);
														$.next(2);
														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_14 = $.sibling(node_13, 2);

											$.component(node_14, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
												Tabs_Content_1($$anchor, {
													value: 'measure',
													class: 'mt-4 flex-1 overflow-y-auto pb-4',
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root_7();
														var ol = $.first_child(fragment_7);

														$.each(ol, 21, () => measureSteps, $.index, ($$anchor, step, i) => {
															var li = root_6();
															var span_1 = $.child(li);

															span_1.textContent = i + 1;

															var span_2 = $.sibling(span_1, 2);
															var text_7 = $.only_child(span_2, true);

															$.reset(li);
															$.template_effect(() => $.set_text(text_7, $.get(step)));
															$.append($$anchor, li);
														});

														$.reset(ol);
														$.next(2);
														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div);
								$.transition(1, div, () => fly, () => ({ duration: 300 }));
								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.bind_window_size('innerWidth', ($$value) => $.set(innerWidth, $$value, true));
	$.append($$anchor, fragment);
	$.pop();
}