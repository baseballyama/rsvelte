import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs } from "bits-ui";
import Airplane from "phosphor-svelte/lib/Airplane";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-3 grid-rows-2 gap-0 p-4 pb-1"><div class="text-left"><h4 class="mb-2 text-[20px] font-semibold leading-none tracking-[-0.01em]">Prague</h4> <p class="text-muted-foreground text-sm font-medium">06:05</p></div> <div class="self-end text-center"><p class="text-muted-foreground text-sm font-medium">3h 30m</p></div> <div class="text-right"><h4 class="mb-2 text-[20px] font-semibold leading-none tracking-[-0.01em]">Malaga</h4> <p class="text-muted-foreground text-sm font-medium">06:05</p></div> <div class="relative col-span-3"><hr class="border-border-input border-1 relative top-4 h-px border-dashed"/> <div class="bg-background-alt absolute left-1/2 -translate-x-1/2 p-1"><!></div></div></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-3 grid-rows-2 gap-0 p-4 pb-1"><div class="text-left"><h4 class="mb-2 text-[20px] font-semibold leading-none tracking-[-0.01em]">Malaga</h4> <p class="text-muted-foreground text-sm font-medium">07:25</p></div> <div class="self-end text-center"><p class="text-muted-foreground text-sm font-medium">3h 20m</p></div> <div class="text-right"><h4 class="mb-2 text-[20px] font-semibold leading-none tracking-[-0.01em]">Prague</h4> <p class="text-muted-foreground text-sm font-medium">10:45</p></div> <div class="relative col-span-3"><hr class="border-border-input border-1 relative top-4 h-px border-dashed"/> <div class="bg-background-alt absolute left-1/2 -translate-x-1/2 p-1"><!></div></div></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="pt-6"><!></div>`);

export default function Tabs_demo($$anchor) {
	var div = root_4();
	var node = $.child(div);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			value: 'outbound',
			class: 'rounded-card border-muted bg-background-alt shadow-card w-[390px] border p-3',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'rounded-9px bg-dark-10 shadow-mini-inset dark:bg-background grid w-full grid-cols-2 gap-1 p-1 text-sm font-semibold leading-[0.01em] dark:border dark:border-neutral-600/30',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'outbound',
									class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-white',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Outbound');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'inbound',
									class: 'data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-white',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Inbound');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'outbound',
						class: 'select-none pt-3',
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_1();
							var div_2 = $.sibling($.child(div_1), 6);
							var div_3 = $.sibling($.child(div_2), 2);
							var node_5 = $.child(div_3);

							Airplane(node_5, { class: 'text-muted-foreground size-6 rotate-90' });
							$.reset(div_3);
							$.reset(div_2);
							$.reset(div_1);
							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_4, 2);

				$.component(node_6, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'inbound',
						class: 'select-none pt-3',
						children: ($$anchor, $$slotProps) => {
							var div_4 = root_2();
							var div_5 = $.sibling($.child(div_4), 6);
							var div_6 = $.sibling($.child(div_5), 2);
							var node_7 = $.child(div_6);

							Airplane(node_7, { class: 'text-muted-foreground size-6 rotate-90' });
							$.reset(div_6);
							$.reset(div_5);
							$.reset(div_4);
							$.append($$anchor, div_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}