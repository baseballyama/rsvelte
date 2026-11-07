import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from "$lib/registry/ui/card/index.js";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarProvider
} from "$lib/registry/ui/sidebar/index.js";

import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Sidebar_section($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => cn("w-full overflow-hidden rounded-3xl py-0", $$props.class));

		Card($$anchor, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				SidebarProvider($$anchor, {
					class: 'min-h-0',
					children: ($$anchor, $$slotProps) => {
						Sidebar($$anchor, {
							collapsible: 'none',
							class: 'w-full bg-transparent',
							children: ($$anchor, $$slotProps) => {
								SidebarContent($$anchor, {
									class: 'gap-0 overflow-hidden',
									children: ($$anchor, $$slotProps) => {
										SidebarGroup($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node = $.first_child(fragment_5);

												SidebarGroupLabel(node, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, $$props.label));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});

												var node_1 = $.sibling(node, 2);

												SidebarGroupContent(node_1, {
													children: ($$anchor, $$slotProps) => {
														SidebarMenu($$anchor, {
															class: 'gap-1',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_2 = $.first_child(fragment_8);

																$.snippet(node_2, () => $$props.children ?? $.noop);
																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}