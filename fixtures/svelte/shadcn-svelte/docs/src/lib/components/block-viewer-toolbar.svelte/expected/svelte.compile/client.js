import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import FullscreenIcon from "@lucide/svelte/icons/fullscreen";
import MonitorIcon from "@lucide/svelte/icons/monitor";
import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
import SmartphoneIcon from "@lucide/svelte/icons/smartphone";
import TabletIcon from "@lucide/svelte/icons/tablet";
import TerminalIcon from "@lucide/svelte/icons/terminal";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { getCommand } from "$lib/package-manager.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { BlockViewerContext } from "./block-viewer.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="sr-only">Open in New Tab</span> <!>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Refresh Preview</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <span class="hidden lg:inline"> </span>`, 1);
var root_5 = $.from_html(`<div class="hidden w-full items-center gap-2 ps-2 md:pe-6 lg:flex"><!> <!> <a class="flex-1 text-center text-sm font-medium underline-offset-2 hover:underline md:flex-auto md:text-start"> </a> <div class="ms-auto flex items-center gap-2"><div class="h-8 items-center gap-1.5 rounded-md border p-1 shadow-none"><!></div> <!> <!></div></div>`);

export default function Block_viewer_toolbar($$anchor, $$props) {
	$.push($$props, true);

	const ctx = BlockViewerContext.get();
	const userConfig = UserConfigContext.get();
	const clipboard = new UseClipboard();
	const addCommand = $.derived(() => getCommand(userConfig.current.packageManager, "execute", `shadcn-svelte@latest add ${ctx.item.name}`));
	const command = $.derived(() => $.get(addCommand).command + " " + $.get(addCommand).args.join(" "));
	var div = root_5();
	var node = $.child(div);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			class: 'hidden lg:flex',
			get value() {
				return ctx.view;
			},

			set value($$value) {
				ctx.view = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'grid h-8 grid-cols-2 items-center rounded-md p-1 *:data-[slot=tabs-trigger]:h-6 *:data-[slot=tabs-trigger]:rounded-sm *:data-[slot=tabs-trigger]:px-2 *:data-[slot=tabs-trigger]:text-xs',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'preview',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Preview');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'code',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Code');

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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node, 2);

	Separator(node_4, { orientation: 'vertical', class: 'mx-2 !h-4' });

	var a = $.sibling(node_4, 2);
	var text_2 = $.only_child(a, true);
	var div_1 = $.sibling(a, 2);
	var div_2 = $.child(div_1);
	var node_5 = $.child(div_2);

	$.component(node_5, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
		ToggleGroup_Root($$anchor, {
			type: 'single',
			value: '100',
			onValueChange: (value) => {
				if (ctx.resizablePaneRef) {
					ctx.resizablePaneRef.resize(parseInt(value));
				}
			},
			class: 'gap-1 *:data-[slot=toggle-group-item]:!size-6 *:data-[slot=toggle-group-item]:!rounded-sm',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_3();
				var node_6 = $.first_child(fragment_2);

				$.component(node_6, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
					ToggleGroup_Item($$anchor, {
						value: '100',
						title: 'Desktop',
						children: ($$anchor, $$slotProps) => {
							MonitorIcon($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
					ToggleGroup_Item_1($$anchor, {
						value: '60',
						title: 'Tablet',
						children: ($$anchor, $$slotProps) => {
							TabletIcon($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
					ToggleGroup_Item_2($$anchor, {
						value: '30',
						title: 'Mobile',
						children: ($$anchor, $$slotProps) => {
							SmartphoneIcon($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_8, 2);

				Separator(node_9, { orientation: 'vertical', class: '!h-4' });

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					size: 'icon',
					variant: 'ghost',
					class: 'size-6 rounded-sm p-0',
					title: 'Open in New Tab',
					get href() {
						return `/view/${ctx.item.name ?? ''}`;
					},
					target: '_blank',
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_1();
						var node_11 = $.sibling($.first_child(fragment_6), 2);

						FullscreenIcon(node_11, {});
						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_10, 2);

				Separator(node_12, { orientation: 'vertical', class: '!h-4' });

				var node_13 = $.sibling(node_12, 2);

				Button(node_13, {
					size: 'icon',
					variant: 'ghost',
					class: 'size-6 rounded-sm p-0',
					title: 'Refresh Preview',
					onclick: () => {
						ctx.iframeKey = ctx.iframeKey + 1;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_2();
						var node_14 = $.first_child(fragment_7);

						RotateCcwIcon(node_14, {});
						$.next(2);
						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);

	var node_15 = $.sibling(div_2, 2);

	Separator(node_15, { orientation: 'vertical', class: 'mx-1 !h-4' });

	var node_16 = $.sibling(node_15, 2);

	Button(node_16, {
		variant: 'outline',
		class: 'w-fit gap-1 px-2 shadow-none',
		size: 'sm',
		onclick: () => clipboard.copy($.get(command)),
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_4();
			var node_17 = $.first_child(fragment_8);

			{
				var consequent = ($$anchor) => {
					CheckIcon($$anchor, {});
				};

				var alternate = ($$anchor) => {
					TerminalIcon($$anchor, {});
				};

				$.if(node_17, ($$render) => {
					if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var span = $.sibling(node_17, 2);
			var text_3 = $.only_child(span, true);

			$.template_effect(() => $.set_text(text_3, $.get(command)));
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_attribute(a, 'href', `#${ctx.item.name ?? ''}`);
			$.set_text(text_2, $0);
		},
		[() => ctx.item.description?.replace(/\.$/, "")]
	);

	$.append($$anchor, div);
	$.pop();
}