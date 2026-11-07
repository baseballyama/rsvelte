import * as $ from 'svelte/internal/server';
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

export default function Sidebar_section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, class: className, children } = $$props;

		Card($$renderer, {
			class: cn("w-full overflow-hidden rounded-3xl py-0", className),
			children: ($$renderer) => {
				SidebarProvider($$renderer, {
					class: 'min-h-0',
					children: ($$renderer) => {
						Sidebar($$renderer, {
							collapsible: 'none',
							class: 'w-full bg-transparent',
							children: ($$renderer) => {
								SidebarContent($$renderer, {
									class: 'gap-0 overflow-hidden',
									children: ($$renderer) => {
										SidebarGroup($$renderer, {
											children: ($$renderer) => {
												SidebarGroupLabel($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(label)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												SidebarGroupContent($$renderer, {
													children: ($$renderer) => {
														SidebarMenu($$renderer, {
															class: 'gap-1',
															children: ($$renderer) => {
																children?.($$renderer);
																$$renderer.push(`<!---->`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
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
	});
}