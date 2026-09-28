import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RotateCCWIcon from "@lucide/svelte/icons/rotate-ccw";
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import Metadata from "$lib/components/metadata.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

import {
	CodeViewer,
	MaxLengthSelector,
	ModelSelector,
	PresetActions,
	PresetSave,
	PresetSelector,
	PresetShare,
	TemperatureSelector,
	TopPSelector
} from "./(components)/index.js";

import { models, types } from "./(data)/models.js";
import { presets } from "./(data)/presets.js";

var root = $.from_html(`<span>Mode</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="sr-only">Complete</span> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" class="size-5"><rect x="4" y="3" width="12" height="2" rx="1" fill="currentColor"></rect><rect x="4" y="7" width="12" height="2" rx="1" fill="currentColor"></rect><rect x="4" y="11" width="3" height="2" rx="1" fill="currentColor"></rect><rect x="4" y="15" width="3" height="2" rx="1" fill="currentColor"></rect><rect x="8.5" y="11" width="3" height="2" rx="1" fill="currentColor"></rect><rect x="8.5" y="15" width="3" height="2" rx="1" fill="currentColor"></rect><rect x="13" y="11" width="3" height="2" rx="1" fill="currentColor"></rect></svg>`, 1);
var root_3 = $.from_html(`<span class="sr-only">Insert</span> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" class="size-5"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.491 7.769a.888.888 0 0 1 .287.648.888.888 0 0 1-.287.648l-3.916 3.667a1.013 1.013 0 0 1-.692.268c-.26 0-.509-.097-.692-.268L5.275 9.065A.886.886 0 0 1 5 8.42a.889.889 0 0 1 .287-.64c.181-.17.427-.267.683-.269.257-.002.504.09.69.258L8.903 9.87V3.917c0-.243.103-.477.287-.649.183-.171.432-.268.692-.268.26 0 .509.097.692.268a.888.888 0 0 1 .287.649V9.87l2.245-2.102c.183-.172.432-.269.692-.269.26 0 .508.097.692.269Z" fill="currentColor"></path><rect x="4" y="15" width="3" height="2" rx="1" fill="currentColor"></rect><rect x="8.5" y="15" width="3" height="2" rx="1" fill="currentColor"></rect><rect x="13" y="15" width="3" height="2" rx="1" fill="currentColor"></rect></svg>`, 1);
var root_4 = $.from_html(`<span class="sr-only">Edit</span> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" class="size-5"><rect x="4" y="3" width="12" height="2" rx="1" fill="currentColor"></rect><rect x="4" y="7" width="12" height="2" rx="1" fill="currentColor"></rect><rect x="4" y="11" width="3" height="2" rx="1" fill="currentColor"></rect><rect x="4" y="15" width="4" height="2" rx="1" fill="currentColor"></rect><rect x="8.5" y="11" width="3" height="2" rx="1" fill="currentColor"></rect><path d="M17.154 11.346a1.182 1.182 0 0 0-1.671 0L11 15.829V17.5h1.671l4.483-4.483a1.182 1.182 0 0 0 0-1.671Z" fill="currentColor"></path></svg>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<span class="sr-only">Show history</span> <!>`, 1);
var root_7 = $.from_html(`<div class="flex h-full flex-col space-y-4"><!> <div class="flex items-center space-x-2"><!> <!></div></div>`);
var root_8 = $.from_html(`<div class="flex flex-col space-y-4"><div class="grid h-full grid-rows-2 gap-6 lg:grid-cols-2 lg:grid-rows-1"><!> <div class="rounded-md border bg-muted"></div></div> <div class="flex items-center space-x-2"><!> <!></div></div>`);
var root_9 = $.from_html(`<div class="flex flex-col space-y-4"><div class="grid h-full gap-6 lg:grid-cols-2"><div class="flex flex-col space-y-4"><div class="flex flex-1 flex-col space-y-2"><!> <!></div> <div class="flex flex-col space-y-2"><!> <!></div></div> <div class="mt-[21px] min-h-[400px] rounded-md border bg-muted lg:min-h-[700px]"></div></div> <div class="flex items-center space-x-2"><!> <!></div></div>`);
var root_10 = $.from_html(`<div class="container h-full py-6"><div class="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px]"><div class="hidden flex-col space-y-4 sm:flex md:order-2"><div class="grid gap-2"><!> <!></div> <!> <!> <!> <!></div> <div class="md:order-1"><!> <!> <!></div></div></div>`);
var root_11 = $.from_html(`<!> <div class="md:hidden"><img src="/img/examples/playground-light.png" alt="Playground" class="block dark:hidden"/> <img src="/img/examples/playground-dark.png" alt="Playground" class="hidden dark:block"/></div> <div class="hidden h-full flex-col md:flex"><div class="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16"><h2 class="text-lg font-semibold">Playground</h2> <div class="ms-auto flex w-full space-x-2 sm:justify-end"><!> <!> <div class="hidden space-x-2 md:flex"><!> <!></div> <!></div></div> <!> <!></div>`, 1);

export default function _page($$anchor) {
	const title = "Playground";
	const description = "The OpenAI Playground build using the components.";
	var fragment = root_11();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
		}));

		Metadata(node, {
			title,
			description,
			get ogImage() {
				return $.get($0);
			}
		});
	}

	var div = $.sibling(node, 4);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node_1 = $.child(div_2);

	PresetSelector(node_1, {
		get presets() {
			return presets;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	PresetSave(node_2, {});

	var div_3 = $.sibling(node_2, 2);
	var node_3 = $.child(div_3);

	CodeViewer(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	PresetShare(node_4, {});
	$.reset(div_3);

	var node_5 = $.sibling(div_3, 2);

	PresetActions(node_5, {});
	$.reset(div_2);
	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	Separator(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			value: 'complete',
			class: 'flex-1',
			children: ($$anchor, $$slotProps) => {
				var div_4 = root_10();
				var div_5 = $.child(div_4);
				var div_6 = $.child(div_5);
				var div_7 = $.child(div_6);
				var node_8 = $.child(div_7);

				$.component(node_8, () => HoverCard.Root, ($$anchor, HoverCard_Root) => {
					HoverCard_Root($$anchor, {
						openDelay: 200,
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_9 = $.first_child(fragment_1);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var span = root();

									$.attribute_effect(span, () => ({
										class: 'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
										...props()
									}));

									$.append($$anchor, span);
								};

								$.component(node_9, () => HoverCard.Trigger, ($$anchor, HoverCard_Trigger) => {
									HoverCard_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_10 = $.sibling(node_9, 2);

							$.component(node_10, () => HoverCard.Content, ($$anchor, HoverCard_Content) => {
								HoverCard_Content($$anchor, {
									class: 'w-[320px] text-sm',
									side: 'left',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Choose the interface that best suits your task. You can provide: a simple prompt to\n								complete, starting and ending text to insert a completion within, or some text with\n								instructions to edit it.');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_8, 2);

				$.component(node_11, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'grid grid-cols-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_5();
							var node_12 = $.first_child(fragment_2);

							$.component(node_12, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'complete',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();

										$.next(2);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_12, 2);

							$.component(node_13, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'insert',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_3();

										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_13, 2);

							$.component(node_14, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
								Tabs_Trigger_2($$anchor, {
									value: 'edit',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_4();

										$.next(2);
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_7);

				var node_15 = $.sibling(div_7, 2);

				ModelSelector(node_15, {
					get types() {
						return types;
					},

					get models() {
						return models;
					}
				});

				var node_16 = $.sibling(node_15, 2);

				TemperatureSelector(node_16, { type: 'single', value: 0.56 });

				var node_17 = $.sibling(node_16, 2);

				MaxLengthSelector(node_17, { type: 'single', value: 256 });

				var node_18 = $.sibling(node_17, 2);

				TopPSelector(node_18, { type: 'single', value: 0.9 });
				$.reset(div_6);

				var div_8 = $.sibling(div_6, 2);
				var node_19 = $.child(div_8);

				$.component(node_19, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'complete',
						class: 'mt-0 border-0 p-0',
						children: ($$anchor, $$slotProps) => {
							var div_9 = root_7();
							var node_20 = $.child(div_9);

							Textarea(node_20, {
								placeholder: 'Write a tagline for an ice cream shop',
								class: 'min-h-[400px] flex-1 p-4 md:min-h-[700px] lg:min-h-[700px]'
							});

							var div_10 = $.sibling(node_20, 2);
							var node_21 = $.child(div_10);

							Button(node_21, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Submit');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_22 = $.sibling(node_21, 2);

							Button(node_22, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_6();
									var node_23 = $.sibling($.first_child(fragment_6), 2);

									RotateCCWIcon(node_23, { class: 'size-4' });
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							$.reset(div_10);
							$.reset(div_9);
							$.append($$anchor, div_9);
						},
						$$slots: { default: true }
					});
				});

				var node_24 = $.sibling(node_19, 2);

				$.component(node_24, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'insert',
						class: 'mt-0 border-0 p-0',
						children: ($$anchor, $$slotProps) => {
							var div_11 = root_8();
							var div_12 = $.child(div_11);
							var node_25 = $.child(div_12);

							Textarea(node_25, {
								placeholder: 'We\'re writing to [inset]. Congrats from OpenAI!',
								class: 'h-full min-h-[300px] lg:min-h-[700px] xl:min-h-[700px]'
							});

							$.next(2);
							$.reset(div_12);

							var div_13 = $.sibling(div_12, 2);
							var node_26 = $.child(div_13);

							Button(node_26, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Submit');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_27 = $.sibling(node_26, 2);

							Button(node_27, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_6();
									var node_28 = $.sibling($.first_child(fragment_7), 2);

									RotateCCWIcon(node_28, { class: 'size-4' });
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							$.reset(div_13);
							$.reset(div_11);
							$.append($$anchor, div_11);
						},
						$$slots: { default: true }
					});
				});

				var node_29 = $.sibling(node_24, 2);

				$.component(node_29, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
					Tabs_Content_2($$anchor, {
						value: 'edit',
						class: 'mt-0 border-0 p-0',
						children: ($$anchor, $$slotProps) => {
							var div_14 = root_9();
							var div_15 = $.child(div_14);
							var div_16 = $.child(div_15);
							var div_17 = $.child(div_16);
							var node_30 = $.child(div_17);

							Label(node_30, {
								for: 'input',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Input');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_31 = $.sibling(node_30, 2);

							Textarea(node_31, {
								id: 'input',
								placeholder: 'We is going to the market.',
								class: 'flex-1 lg:min-h-[580px]'
							});

							$.reset(div_17);

							var div_18 = $.sibling(div_17, 2);
							var node_32 = $.child(div_18);

							Label(node_32, {
								for: 'instructions',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Instructions');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_32, 2);

							Textarea(node_33, { id: 'instructions', placeholder: 'Fix the grammar.' });
							$.reset(div_18);
							$.reset(div_16);
							$.next(2);
							$.reset(div_15);

							var div_19 = $.sibling(div_15, 2);
							var node_34 = $.child(div_19);

							Button(node_34, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Submit');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_35 = $.sibling(node_34, 2);

							Button(node_35, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_6();
									var node_36 = $.sibling($.first_child(fragment_8), 2);

									RotateCCWIcon(node_36, { class: 'size-4' });
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							$.reset(div_19);
							$.reset(div_14);
							$.append($$anchor, div_14);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_8);
				$.reset(div_5);
				$.reset(div_4);
				$.append($$anchor, div_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, fragment);
}