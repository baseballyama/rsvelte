import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Bot from "@lucide/svelte/icons/bot";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> Copilot`, 1);

var root_1 = $.from_html(
	`<div class="px-4 py-3"><div class="text-sm font-medium">Agent Tasks</div></div> <!> <div class="p-4 text-sm *:[p:not(:last-child)]:mb-2"><!> <p class="font-medium">Start a new task with Copilot</p> <p class="text-muted-foreground">Describe your task in natural language. Copilot will work in the background and open a
					pull request for your review.</p></div>`,
	1
);

var root_2 = $.from_html(`<!> <!>`, 1);

export default function Button_group_popover($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				Button(node_1, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Bot(node_2, {});
						$.next();
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Popover.Root, ($$anchor, Popover_Root) => {
					Popover_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_4 = $.first_child(fragment_3);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;

									Button($$anchor, $.spread_props(props, {
										variant: 'outline',
										size: 'icon',
										'aria-label': 'Open Popover',
										children: ($$anchor, $$slotProps) => {
											ChevronDown($$anchor, {});
										},
										$$slots: { default: true }
									}));
								};

								$.component(node_4, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
									Popover_Trigger($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									align: 'end',
									class: 'rounded-xl p-0 text-sm',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();
										var node_6 = $.sibling($.first_child(fragment_6), 2);

										Separator(node_6, {});

										var div = $.sibling(node_6, 2);
										var node_7 = $.child(div);

										Textarea(node_7, {
											placeholder: 'Describe your task in natural language.',
											class: 'mb-4 resize-none'
										});

										$.next(4);
										$.reset(div);
										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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
}