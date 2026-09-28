import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from '$lib/components/ui/sidebar';
import * as Dialog from '$lib/components/ui/dialog';
import { Separator } from '$lib/components/ui/separator';
import EmptyState from '$lib/components/EmptyState.svelte';

import {
	LayoutTemplate,
	Info,
	Globe,
	ExternalLink,
	SquarePen,
	CheckCircle
} from 'lucide-svelte';

import MarketplaceStarterButton from '$lib/components/MarketplaceStarterButton.svelte';
import { Button } from '$lib/components/ui/button';
import { page } from '$app/state';
import { Skeleton } from '$lib/components/ui/skeleton';
import { goto } from '$app/navigation';
import { marketplace } from '$lib/pocketbase/managers';
import { SiteGroups, Sites } from '$lib/pocketbase/collections';

var root = $.from_html(`<!> How to Use Starters`, 1);
var root_1 = $.from_html(`<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><!></div>`);
var root_2 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">How to Use Starter Sites</h2> <p class="text-muted-foreground text-sm mb-6">Follow these steps to create a new site using a starter:</p> <div class="space-y-4"><div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"><!></div> <div><h3 class="font-medium text-sm mb-1">Connect a new domain name to the server</h3> <p class="text-muted-foreground text-sm">Point your domain's DNS records to this server or configure your hosting provider to route traffic here.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"><!></div> <div><h3 class="font-medium text-sm mb-1">Access the server from that domain name</h3> <p class="text-muted-foreground text-sm">Once the domain is connected, visit your new domain in a web browser. You'll be prompted to create a new site automatically.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"><!></div> <div><h3 class="font-medium text-sm mb-1">Choose a starter site</h3> <p class="text-muted-foreground text-sm">During the site creation process, you can select one of these starter sites as a starting point for your new site. The starter will be cloned and customized for your domain.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"><!></div> <div><h3 class="font-medium text-sm mb-1">Customize your site</h3> <p class="text-muted-foreground text-sm">After creation, you can edit the content, design, and functionality of your site using the built-in editor.</p></div></div></div> <!>`, 1);
var root_3 = $.from_html(`<header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3"><!> <!> <div class="text-sm">Starter Sites</div></div> <div class="ml-auto mr-4"><!></div></header> <div class="flex flex-1 flex-col gap-4 px-4 pb-4"><!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const group_id = $.derived(() => page.url.searchParams.get('group') ?? undefined);

	const starters = $.derived(() => $.get(group_id)
		? Sites.from(marketplace).list({ filter: { group: $.get(group_id) }, sort: 'index' }) ?? undefined
		: undefined);

	let is_info_dialog_open = $.state(false);

	// Auto-select first group if none is selected
	$.user_effect(() => {
		const groups = SiteGroups.from(marketplace).list({ sort: 'index' }) ?? [];

		if (!$.get(group_id) && groups.length > 0) {
			const url = new URL(page.url);

			url.searchParams.set('group', groups[0].id);
			goto(url, { replaceState: true });
		}
	});

	var fragment = root_3();
	var header = $.first_child(fragment);
	var div = $.child(header);
	var node = $.child(div);

	$.component(node, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
		Sidebar_Trigger($$anchor, {});
	});

	var node_1 = $.sibling(node, 2);

	Separator(node_1, { orientation: 'vertical', class: 'mr-2 h-4' });
	$.next(2);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	Button(node_2, {
		size: 'sm',
		variant: 'outline',
		onclick: () => $.set(is_info_dialog_open, true),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			Info(node_3, { class: 'h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(header);

	var div_2 = $.sibling(header, 2);
	var node_4 = $.child(div_2);

	$.key(node_4, () => $.get(group_id), ($$anchor) => {
		var fragment_2 = $.comment();
		var node_5 = $.first_child(fragment_2);

		{
			var consequent_1 = ($$anchor) => {
				var div_3 = root_1();
				var node_6 = $.child(div_3);

				{
					var consequent = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_7 = $.first_child(fragment_3);

						$.each(node_7, 16, () => Array.from({ length: 8 }), $.index, ($$anchor, _) => {
							Skeleton($$anchor, { class: 'aspect-video w-full' });
						});

						$.append($$anchor, fragment_3);
					};

					var alternate = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.each(node_8, 17, () => $.get(starters), (site) => site.id, ($$anchor, site) => {
							MarketplaceStarterButton($$anchor, {
								get site() {
									return $.get(site);
								}
							});
						});

						$.append($$anchor, fragment_5);
					};

					$.if(node_6, ($$render) => {
						if ($.get(starters) === undefined) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div_3);
				$.append($$anchor, div_3);
			};

			var alternate_1 = ($$anchor) => {
				EmptyState($$anchor, {
					class: 'h-[50vh]',
					get icon() {
						return LayoutTemplate;
					},
					title: 'No Starters to display',
					description: 'Starters are starting points for your sites. When you create one it\'ll show up here.'
				});
			};

			$.if(node_5, ($$render) => {
				if ($.get(starters)?.length || $.get(starters) === undefined) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment_2);
	});

	$.reset(div_2);

	var node_9 = $.sibling(div_2, 2);

	$.component(node_9, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(is_info_dialog_open);
			},

			set open($$value) {
				$.set(is_info_dialog_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_8 = $.comment();
				var node_10 = $.first_child(fragment_8);

				$.component(node_10, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[525px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_2();
							var div_4 = $.sibling($.first_child(fragment_9), 4);
							var div_5 = $.child(div_4);
							var div_6 = $.child(div_5);
							var node_11 = $.child(div_6);

							Globe(node_11, { class: 'w-3 h-3' });
							$.reset(div_6);
							$.next(2);
							$.reset(div_5);

							var div_7 = $.sibling(div_5, 2);
							var div_8 = $.child(div_7);
							var node_12 = $.child(div_8);

							ExternalLink(node_12, { class: 'w-3 h-3' });
							$.reset(div_8);
							$.next(2);
							$.reset(div_7);

							var div_9 = $.sibling(div_7, 2);
							var div_10 = $.child(div_9);
							var node_13 = $.child(div_10);

							LayoutTemplate(node_13, { class: 'w-3 h-3' });
							$.reset(div_10);
							$.next(2);
							$.reset(div_9);

							var div_11 = $.sibling(div_9, 2);
							var div_12 = $.child(div_11);
							var node_14 = $.child(div_12);

							SquarePen(node_14, { class: 'w-3 h-3' });
							$.reset(div_12);
							$.next(2);
							$.reset(div_11);
							$.reset(div_4);

							var node_15 = $.sibling(div_4, 2);

							$.component(node_15, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									class: 'mt-6',
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											type: 'button',
											onclick: () => $.set(is_info_dialog_open, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Got it');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}