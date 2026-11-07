import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const group_id = $.derived(() => page.url.searchParams.get('group') ?? undefined);

		const starters = $.derived(() => group_id()
			? Sites.from(marketplace).list({ filter: { group: group_id() }, sort: 'index' }) ?? undefined
			: undefined);

		let is_info_dialog_open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3">`);

			if (Sidebar.Trigger) {
				$$renderer.push('<!--[-->');
				Sidebar.Trigger($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);
			Separator($$renderer, { orientation: 'vertical', class: 'mr-2 h-4' });
			$$renderer.push(`<!----> <div class="text-sm">Starter Sites</div></div> <div class="ml-auto mr-4">`);

			Button($$renderer, {
				size: 'sm',
				variant: 'outline',
				onclick: () => is_info_dialog_open = true,
				children: ($$renderer) => {
					Info($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!----> How to Use Starters`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></header> <div class="flex flex-1 flex-col gap-4 px-4 pb-4"><!---->`);

			{
				if (starters()?.length || starters() === undefined) {
					$$renderer.push(`<!--[0--><div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">`);

					if (starters() === undefined) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array = $.ensure_array_like(Array.from({ length: 8 }));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let _ = each_array[$$index];

							Skeleton($$renderer, { class: 'aspect-video w-full' });
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array_1 = $.ensure_array_like(starters());

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let site = each_array_1[$$index_1];

							MarketplaceStarterButton($$renderer, { site });
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					EmptyState($$renderer, {
						class: 'h-[50vh]',
						icon: LayoutTemplate,
						title: 'No Starters to display',
						description: 'Starters are starting points for your sites. When you create one it\'ll show up here.'
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!----></div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_info_dialog_open;
					},

					set open($$value) {
						is_info_dialog_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[525px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">How to Use Starter Sites</h2> <p class="text-muted-foreground text-sm mb-6">Follow these steps to create a new site using a starter:</p> <div class="space-y-4"><div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">`);
									Globe($$renderer, { class: 'w-3 h-3' });
									$$renderer.push(`<!----></div> <div><h3 class="font-medium text-sm mb-1">Connect a new domain name to the server</h3> <p class="text-muted-foreground text-sm">Point your domain's DNS records to this server or configure your hosting provider to route traffic here.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">`);
									ExternalLink($$renderer, { class: 'w-3 h-3' });
									$$renderer.push(`<!----></div> <div><h3 class="font-medium text-sm mb-1">Access the server from that domain name</h3> <p class="text-muted-foreground text-sm">Once the domain is connected, visit your new domain in a web browser. You'll be prompted to create a new site automatically.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">`);
									LayoutTemplate($$renderer, { class: 'w-3 h-3' });
									$$renderer.push(`<!----></div> <div><h3 class="font-medium text-sm mb-1">Choose a starter site</h3> <p class="text-muted-foreground text-sm">During the site creation process, you can select one of these starter sites as a starting point for your new site. The starter will be cloned and customized for your domain.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">`);
									SquarePen($$renderer, { class: 'w-3 h-3' });
									$$renderer.push(`<!----></div> <div><h3 class="font-medium text-sm mb-1">Customize your site</h3> <p class="text-muted-foreground text-sm">After creation, you can edit the content, design, and functionality of your site using the built-in editor.</p></div></div></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											class: 'mt-6',
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													onclick: () => is_info_dialog_open = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Got it`);
													},
													$$slots: { default: true }
												});
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
	});
}