import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from '$lib/components/ui/dialog';
import * as Sidebar from '$lib/components/ui/sidebar';
import * as AlertDialog from '$lib/components/ui/alert-dialog';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import * as RadioGroup from '$lib/components/ui/radio-group';
import { Label } from '$lib/components/ui/label';
import SitePreview from '$lib/components/SitePreview.svelte';
import { Input } from '$lib/components/ui/input';
import EmptyState from '$lib/components/EmptyState.svelte';
import { Separator } from '$lib/components/ui/separator';
import { Button } from '$lib/components/ui/button';

import {
	Globe,
	Loader,
	ChevronDown,
	SquarePen,
	Trash2,
	EllipsisVertical,
	ArrowLeftRight,
	Download,
	CirclePlus
} from 'lucide-svelte';

import { useSidebar } from '$lib/components/ui/sidebar';
import { page } from '$app/state';
import { Sites, SiteGroups, Pages } from '$lib/pocketbase/collections';
import { self as pb, self } from '$lib/pocketbase/managers';
import { goto } from '$app/navigation';
import { ClientResponseError } from 'pocketbase';
import { useSiteSnapshot } from '$lib/Snapshot.svelte';
import { Snapshot } from '$lib/common/models/Snapshot';
import { instance } from '$lib/instance';
import { is_host_assigned, site_editor_url } from '$lib/site_host';
import CreateSite from '$lib/components/CreateSite.svelte';
import ConnectDomain from '$lib/components/ConnectDomain.svelte';

var root = $.from_html(`<!> <span>Rename</span>`, 1);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <span>Move</span>`, 1);
var root_3 = $.from_html(`<!> <span>Downloading...</span>`, 1);
var root_4 = $.from_html(`<!> <span>Download</span>`, 1);
var root_5 = $.from_html(`<!> <span>Delete</span>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<div class="space-y-3 relative w-full bg-[#111]"><div class="rounded-tl rounded-tr overflow-hidden"><a><!></a></div> <div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-[#111] truncate flex items-center justify-between"><div class="flex flex-col gap-1" style="max-width: calc(100% - 2rem)"><a class="text-sm font-medium leading-none truncate"> </a> <p class="text-xs text-muted-foreground leading-tight truncate"> </p></div> <!></div></div>`);
var root_9 = $.from_html(`<button><!> <span class="sr-only">More</span></button>`);
var root_10 = $.from_html(`<span class="text-xs text-muted-foreground"> </span>`);
var root_11 = $.from_html(`<!> Create Site`, 1);
var root_12 = $.from_html(`<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></div>`);
var root_13 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename group</h2> <p class="text-muted-foreground text-sm">Enter a new name for your group</p> <form><!> <!></form>`, 1);
var root_14 = $.from_html(`This action cannot be undone. This will permanently delete <strong> </strong> and <strong>all</strong> its sites.`, 1);
var root_15 = $.from_html(`<div class="animate-spin absolute"><!></div>`);
var root_16 = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);
var root_17 = $.from_html(`<div class="grid gap-4"><div class="space-y-2"><h4 class="font-medium leading-none">Move to group</h4> <p class="text-muted-foreground text-sm">Select a group for this site</p></div> <!> <div class="flex justify-end"><!></div></div>`);
var root_18 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Site</h2> <p class="text-muted-foreground text-sm">Enter a new name for your site</p> <form><!> <!></form>`, 1);
var root_19 = $.from_html(`This action cannot be undone. This will permanently delete <strong> </strong> and remove all associated data.`, 1);
var root_20 = $.from_html(`<div class="fixed inset-0 z-50 bg-background overflow-auto"><!></div>`);
var root_21 = $.from_html(`<header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3"><!> <!> <div class="text-sm"> </div> <!></div> <div class="ml-auto mr-4 flex items-center gap-3"><!> <!></div></header> <div class="flex flex-1 flex-col gap-4 px-4 pb-4"><!></div> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const // Plan site cap: 0/undefined means unlimited. Enforced server-side in
	// internal/limits.go; this just disables the affordance + shows usage.
	// Connect-a-domain flow lives in the reusable ConnectDomain component; the
	// dashboard just opens it for the selected site.
	// Delete home page first to avoid cascade deletion conflicts
	// Ignore "not found" error
	// Delete the site - PocketBase will cascade delete remaining records
	// Site already deleted - treat as success
	SiteButton = ($$anchor, site = $.noop) => {
		var div = root_8();
		var div_1 = $.child(div);
		var a_1 = $.child(div_1);
		var node = $.child(a_1);

		SitePreview(node, {
			get site() {
				return site();
			}
		});

		$.reset(a_1);
		$.reset(div_1);

		var div_2 = $.sibling(div_1, 2);
		var div_3 = $.child(div_2);
		var a_2 = $.child(div_3);
		var text = $.only_child(a_2, true);
		var p = $.sibling(a_2, 2);
		var text_1 = $.only_child(p, true);

		$.reset(div_3);

		var node_1 = $.sibling(div_3, 2);

		$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
			DropdownMenu_Root($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment = root_7();
					var node_2 = $.first_child(fragment);

					$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							class: 'p-2 hover:bg-[#222] rounded-md',
							children: ($$anchor, $$slotProps) => {
								EllipsisVertical($$anchor, { size: 14 });
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
						DropdownMenu_Content($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_6();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
									DropdownMenu_Item($$anchor, {
										onclick: () => {
											$.set(current_site, site(), true);
											$.set(is_rename_site_open, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_5 = $.first_child(fragment_3);

											SquarePen(node_5, { class: 'h-4 w-4' });
											$.next(2);
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_4, 2);

								$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
									DropdownMenu_Item_1($$anchor, {
										onclick: () => {
											$.set(current_site, site(), true);
											$.set(is_assign_domain_open, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_1();
											var node_7 = $.first_child(fragment_4);

											Globe(node_7, { class: 'h-4 w-4' });

											var span = $.sibling(node_7, 2);
											var text_2 = $.only_child(span, true);

											$.template_effect(($0) => $.set_text(text_2, $0), [
												() => is_host_assigned(site()) ? 'Change domain' : 'Assign domain'
											]);

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_8 = $.sibling(node_6, 2);

								{
									var consequent = ($$anchor) => {
										var fragment_5 = $.comment();
										var node_9 = $.first_child(fragment_5);

										$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
											DropdownMenu_Item_2($$anchor, {
												onclick: () => {
													$.set(current_site, site(), true);
													$.set(is_move_site_open, true);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_2();
													var node_10 = $.first_child(fragment_6);

													ArrowLeftRight(node_10, { class: 'h-4 w-4' });
													$.next(2);
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									};

									$.if(node_8, ($$render) => {
										if ($.get(site_groups).length > 1) $$render(consequent);
									});
								}

								var node_11 = $.sibling(node_8, 2);

								{
									let $0 = $.derived(() => $.get(downloading) && $.get(download_site_id) === site().id);

									$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
										DropdownMenu_Item_3($$anchor, {
											onclick: () => download_site_file(site()),
											get disabled() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_12 = $.first_child(fragment_7);

												{
													var consequent_1 = ($$anchor) => {
														var fragment_8 = root_3();
														var node_13 = $.first_child(fragment_8);

														Loader(node_13, { class: 'h-4 w-4 animate-spin' });
														$.next(2);
														$.append($$anchor, fragment_8);
													};

													var alternate = ($$anchor) => {
														var fragment_9 = root_4();
														var node_14 = $.first_child(fragment_9);

														Download(node_14, { class: 'h-4 w-4' });
														$.next(2);
														$.append($$anchor, fragment_9);
													};

													$.if(node_12, ($$render) => {
														if ($.get(downloading) && $.get(download_site_id) === site().id) $$render(consequent_1); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});
								}

								var node_15 = $.sibling(node_11, 2);

								$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
									DropdownMenu_Item_4($$anchor, {
										onclick: () => {
											$.set(current_site, site(), true);
											$.set(is_delete_site_open, true);
										},
										class: 'text-red-500 hover:text-red-600 focus:text-red-600',
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root_5();
											var node_16 = $.first_child(fragment_10);

											Trash2(node_16, { class: 'h-4 w-4' });
											$.next(2);
											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});

		$.reset(div_2);
		$.reset(div);

		$.template_effect(
			($0, $1, $2) => {
				$.set_attribute(a_1, 'href', $0);
				$.set_attribute(a_2, 'href', $1);
				$.set_text(text, site().name);
				$.set_text(text_1, $2);
			},
			[
				() => site_editor_url(site()),
				() => site_editor_url(site()),
				() => is_host_assigned(site()) ? site().host : 'Unassigned'
			]
		);

		$.append($$anchor, div);
	};

	const sidebar = useSidebar();
	const site_group_id = $.derived(() => page.url.searchParams.get('group'));

	$.user_effect(() => {
		if (!$.get(site_group_id) && $.get(site_groups).length > 0) {
			const url = new URL(page.url);

			url.searchParams.set('group', $.get(site_groups)[0].id);
			goto(url, { replaceState: true });
		}
	});

	const site_groups = $.derived(() => SiteGroups.list() ?? []);
	const active_site_group = $.derived(() => $.get(site_group_id) ? SiteGroups.one($.get(site_group_id)) : undefined);
	const all_sites = $.derived(() => Sites.list() ?? []);

	const sites = $.derived(() => $.get(site_group_id)
		? $.get(all_sites).filter((site) => site.group === $.get(site_group_id))
		: []);

	// Plan site cap: 0/undefined means unlimited. Enforced server-side in
	// internal/limits.go; this just disables the affordance + shows usage.
	const at_site_cap = $.derived(() => !!instance.site_cap && $.get(all_sites).length >= instance.site_cap);

	let is_rename_group_open = $.state(false);
	let new_group_name = $.state('');

	$.user_effect(() => {
		if ($.get(active_site_group)) {
			$.set(new_group_name, $.get(active_site_group).name, true);
		}
	});

	async function handle_group_rename(e) {
		e.preventDefault();

		if (!$.get(active_site_group)) return;

		SiteGroups.update($.get(active_site_group).id, { name: $.get(new_group_name) });
		await self.commit();
		$.set(is_rename_group_open, false);
	}

	let is_delete_group_open = $.state(false);
	let deleting_group = $.state(false);

	async function handle_group_delete() {
		$.set(deleting_group, true);

		if (!$.get(active_site_group)) return;

		SiteGroups.delete($.get(active_site_group).id);
		await self.commit();
		$.set(deleting_group, false);
		$.set(is_delete_group_open, false);
	}

	let download_site_id = $.state(null);
	let download_site_name = $.state(null);
	let downloading = $.state(false);

	const snapshot_worker = $.derived(() => $.get(download_site_id)
		? useSiteSnapshot({ source_site_id: $.get(download_site_id) })
		: null);

	$.user_effect(() => {
		if ($.get(download_site_id) && $.get(snapshot_worker) && $.get(snapshot_worker).status === 'standby' && !$.get(downloading)) {
			$.set(downloading, true);

			$.get(snapshot_worker).run().then((snapshot) => {
				const file = Snapshot.encode(snapshot);
				const url = URL.createObjectURL(file);
				const a = document.createElement('a');

				a.href = url;
				a.download = `${$.get(download_site_name)?.replace(/[^a-zA-Z0-9]/g, '_') ?? 'site'}.primo`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				$.set(download_site_id, null);
				$.set(download_site_name, null);
				$.set(downloading, false);
			}).catch((error) => {
				console.error('Failed to download site:', error);
				$.set(download_site_id, null);
				$.set(download_site_name, null);
				$.set(downloading, false);
			});
		}
	});

	function download_site_file(site) {
		$.set(download_site_id, site.id, true);
		$.set(download_site_name, site.name, true);
	}

	let is_rename_site_open = $.state(false);
	let new_site_name = $.state('');
	let current_site = $.state(null);

	$.user_effect(() => {
		if ($.get(current_site)) {
			$.set(new_site_name, $.get(current_site).name || '', true);
		}
	});

	async function handle_rename() {
		if (!$.get(current_site)) return;

		Sites.update($.get(current_site).id, { name: $.get(new_site_name) });
		await self.commit();
		$.set(is_rename_site_open, false);
	}

	// Connect-a-domain flow lives in the reusable ConnectDomain component; the
	// dashboard just opens it for the selected site.
	let is_assign_domain_open = $.state(false);

	let is_delete_site_open = $.state(false);
	let deleting_site = $.state(false);

	async function delete_site() {
		if (!$.get(current_site)) return;

		$.set(deleting_site, true);

		try {
			const siteId = $.get(current_site).id;

			try {
				// Delete home page first to avoid cascade deletion conflicts
				const home = await pb.instance?.collection('pages').getFirstListItem(`site = "${siteId}" && parent = ""`);

				if (home) {
					Pages.delete(home.id);
				}
			} catch(error) {
				if (error instanceof ClientResponseError && error.status === 404) {
					// Ignore "not found" error
				} else {
					throw error;
				}
			}

			// Delete the site - PocketBase will cascade delete remaining records
			Sites.delete(siteId);

			await self.commit();
			$.set(is_delete_site_open, false);
		} catch(error) {
			if (error instanceof ClientResponseError && error.status === 404) {
				// Site already deleted - treat as success
				$.set(is_delete_site_open, false);
			} else {
				console.error('Error deleting site:', error);
			}
		} finally {
			$.set(deleting_site, false);
		}
	}

	let is_move_site_open = $.state(false);
	let selected_group_id = $.state($.proxy($.get(site_groups)[0]?.id ?? ''));

	async function move_site() {
		if (!$.get(current_site)) return;

		Sites.update($.get(current_site).id, { group: $.get(selected_group_id) });
		await self.commit();
		$.set(is_move_site_open, false);
	}

	let is_creating_site = $.state(false);
	var fragment_11 = root_21();
	var header = $.first_child(fragment_11);
	var div_4 = $.child(header);
	var node_17 = $.child(div_4);

	$.component(node_17, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
		Sidebar_Trigger($$anchor, {});
	});

	var node_18 = $.sibling(node_17, 2);

	Separator(node_18, { orientation: 'vertical', class: 'mr-2 h-4' });

	var div_5 = $.sibling(node_18, 2);
	var text_3 = $.only_child(div_5, true);
	var node_19 = $.sibling(div_5, 2);

	$.component(node_19, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
		DropdownMenu_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_12 = root_7();
				var node_20 = $.first_child(fragment_12);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var button = root_9();

						$.attribute_effect(button, () => ({ ...props() }));

						var node_21 = $.child(button);

						ChevronDown(node_21, { class: 'h-4' });
						$.next(2);
						$.reset(button);
						$.append($$anchor, button);
					};

					$.component(node_20, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
						DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_22 = $.sibling(node_20, 2);

				{
					let $0 = $.derived(() => sidebar.isMobile ? 'end' : 'start');

					$.component(node_22, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
						DropdownMenu_Content_1($$anchor, {
							class: 'w-56 rounded-lg',
							side: 'bottom',
							get align() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_13 = root_7();
								var node_23 = $.first_child(fragment_13);

								$.component(node_23, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
									DropdownMenu_Item_5($$anchor, {
										onclick: () => $.set(is_rename_group_open, true),
										children: ($$anchor, $$slotProps) => {
											var fragment_14 = root();
											var node_24 = $.first_child(fragment_14);

											SquarePen(node_24, { class: 'text-muted-foreground' });
											$.next(2);
											$.append($$anchor, fragment_14);
										},
										$$slots: { default: true }
									});
								});

								var node_25 = $.sibling(node_23, 2);

								{
									var consequent_2 = ($$anchor) => {
										var fragment_15 = $.comment();
										var node_26 = $.first_child(fragment_15);

										$.component(node_26, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
											DropdownMenu_Item_6($$anchor, {
												onclick: () => $.set(is_delete_group_open, true),
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = root_5();
													var node_27 = $.first_child(fragment_16);

													Trash2(node_27, { class: 'text-muted-foreground' });
													$.next(2);
													$.append($$anchor, fragment_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_15);
									};

									$.if(node_25, ($$render) => {
										if ($.get(site_groups)?.length) $$render(consequent_2);
									});
								}

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_12);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var node_28 = $.child(div_6);

	{
		var consequent_3 = ($$anchor) => {
			var span_1 = root_10();
			var text_4 = $.only_child(span_1);

			$.template_effect(() => $.set_text(text_4, `${$.get(all_sites).length ?? ''} of ${instance.site_cap ?? ''} sites`));
			$.append($$anchor, span_1);
		};

		$.if(node_28, ($$render) => {
			if (instance.site_cap) $$render(consequent_3);
		});
	}

	var node_29 = $.sibling(node_28, 2);

	{
		let $0 = $.derived(() => $.get(at_site_cap)
			? 'Site limit reached for your plan. Upgrade to add more sites.'
			: undefined);

		Button(node_29, {
			size: 'sm',
			variant: 'outline',
			get disabled() {
				return $.get(at_site_cap);
			},

			get title() {
				return $.get($0);
			},
			onclick: () => $.set(is_creating_site, true),
			children: ($$anchor, $$slotProps) => {
				var fragment_17 = root_11();
				var node_30 = $.first_child(fragment_17);

				CirclePlus(node_30, { class: 'h-4 w-4' });
				$.next();
				$.append($$anchor, fragment_17);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_6);
	$.reset(header);

	var div_7 = $.sibling(header, 2);
	var node_31 = $.child(div_7);

	{
		var consequent_4 = ($$anchor) => {
			var div_8 = root_12();

			$.each(div_8, 21, () => $.get(sites), $.index, ($$anchor, site) => {
				SiteButton($$anchor, () => $.get(site));
			});

			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		var alternate_1 = ($$anchor) => {
			EmptyState($$anchor, {
				class: 'h-[50vh]',
				get icon() {
					return Globe;
				},
				title: 'No Sites to display',
				description: 'It looks like you haven\'t created any websites yet.'
			});
		};

		$.if(node_31, ($$render) => {
			if ($.get(sites)?.length) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_7);

	var node_32 = $.sibling(div_7, 2);

	$.component(node_32, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(is_rename_group_open);
			},

			set open($$value) {
				$.set(is_rename_group_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_20 = $.comment();
				var node_33 = $.first_child(fragment_20);

				$.component(node_33, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_21 = root_13();
							var form = $.sibling($.first_child(fragment_21), 4);
							var node_34 = $.child(form);

							Input(node_34, {
								placeholder: 'Enter new group name',
								class: 'my-4',
								get value() {
									return $.get(new_group_name);
								},

								set value($$value) {
									$.set(new_group_name, $$value, true);
								}
							});

							var node_35 = $.sibling(node_34, 2);

							$.component(node_35, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root_7();
										var node_36 = $.first_child(fragment_22);

										Button(node_36, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(is_rename_group_open, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Cancel');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});

										var node_37 = $.sibling(node_36, 2);

										Button(node_37, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Rename');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_22);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);
							$.event('submit', form, handle_group_rename);
							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_20);
			},
			$$slots: { default: true }
		});
	});

	var node_38 = $.sibling(node_32, 2);

	$.component(node_38, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(is_delete_group_open);
			},

			set open($$value) {
				$.set(is_delete_group_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_23 = $.comment();
				var node_39 = $.first_child(fragment_23);

				$.component(node_39, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_24 = root_7();
							var node_40 = $.first_child(fragment_24);

							$.component(node_40, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_25 = root_7();
										var node_41 = $.first_child(fragment_25);

										$.component(node_41, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Are you sure?');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										var node_42 = $.sibling(node_41, 2);

										$.component(node_42, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_26 = root_14();
													var strong = $.sibling($.first_child(fragment_26));
													var text_8 = $.only_child(strong, true);

													$.next(3);
													$.template_effect(() => $.set_text(text_8, $.get(active_site_group)?.name));
													$.append($$anchor, fragment_26);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_25);
									},
									$$slots: { default: true }
								});
							});

							var node_43 = $.sibling(node_40, 2);

							$.component(node_43, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_27 = root_7();
										var node_44 = $.first_child(fragment_27);

										$.component(node_44, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Cancel');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										var node_45 = $.sibling(node_44, 2);

										$.component(node_45, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												onclick: handle_group_delete,
												class: 'bg-red-600 hover:bg-red-700',
												children: ($$anchor, $$slotProps) => {
													var fragment_28 = $.comment();
													var node_46 = $.first_child(fragment_28);

													{
														var consequent_5 = ($$anchor) => {
															var div_9 = root_15();
															var node_47 = $.child(div_9);

															Loader(node_47, {});
															$.reset(div_9);
															$.append($$anchor, div_9);
														};

														var alternate_2 = ($$anchor) => {
															var text_10 = $.text();

															$.template_effect(() => $.set_text(text_10, `Delete ${$.get(active_site_group)?.name ?? ''}`));
															$.append($$anchor, text_10);
														};

														$.if(node_46, ($$render) => {
															if ($.get(deleting_group)) $$render(consequent_5); else $$render(alternate_2, -1);
														});
													}

													$.append($$anchor, fragment_28);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_27);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_24);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_23);
			},
			$$slots: { default: true }
		});
	});

	var node_48 = $.sibling(node_38, 2);

	$.component(node_48, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(is_move_site_open);
			},

			set open($$value) {
				$.set(is_move_site_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_30 = $.comment();
				var node_49 = $.first_child(fragment_30);

				$.component(node_49, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var div_10 = root_17();
							var node_50 = $.sibling($.child(div_10), 2);

							$.component(node_50, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
								RadioGroup_Root($$anchor, {
									get value() {
										return $.get(selected_group_id);
									},

									set value($$value) {
										$.set(selected_group_id, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_31 = $.comment();
										var node_51 = $.first_child(fragment_31);

										$.each(node_51, 17, () => $.get(site_groups), $.index, ($$anchor, group) => {
											var div_11 = root_16();
											var node_52 = $.child(div_11);

											$.component(node_52, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
												RadioGroup_Item($$anchor, {
													get value() {
														return $.get(group).id;
													},

													get id() {
														return $.get(group).id;
													}
												});
											});

											var node_53 = $.sibling(node_52, 2);

											Label(node_53, {
												get for() {
													return $.get(group).id;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text();

													$.template_effect(() => $.set_text(text_11, $.get(group).name));
													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});

											$.reset(div_11);
											$.append($$anchor, div_11);
										});

										$.append($$anchor, fragment_31);
									},
									$$slots: { default: true }
								});
							});

							var div_12 = $.sibling(node_50, 2);
							var node_54 = $.child(div_12);

							Button(node_54, {
								onclick: move_site,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Move');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							$.reset(div_12);
							$.reset(div_10);
							$.append($$anchor, div_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_30);
			},
			$$slots: { default: true }
		});
	});

	var node_55 = $.sibling(node_48, 2);

	$.component(node_55, () => Dialog.Root, ($$anchor, Dialog_Root_2) => {
		Dialog_Root_2($$anchor, {
			get open() {
				return $.get(is_rename_site_open);
			},

			set open($$value) {
				$.set(is_rename_site_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_33 = $.comment();
				var node_56 = $.first_child(fragment_33);

				$.component(node_56, () => Dialog.Content, ($$anchor, Dialog_Content_2) => {
					Dialog_Content_2($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_34 = root_18();
							var form_1 = $.sibling($.first_child(fragment_34), 4);
							var node_57 = $.child(form_1);

							Input(node_57, {
								placeholder: 'Enter new site name',
								class: 'my-4',
								get value() {
									return $.get(new_site_name);
								},

								set value($$value) {
									$.set(new_site_name, $$value, true);
								}
							});

							var node_58 = $.sibling(node_57, 2);

							$.component(node_58, () => Dialog.Footer, ($$anchor, Dialog_Footer_1) => {
								Dialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_35 = root_7();
										var node_59 = $.first_child(fragment_35);

										Button(node_59, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(is_rename_site_open, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_13 = $.text('Cancel');

												$.append($$anchor, text_13);
											},
											$$slots: { default: true }
										});

										var node_60 = $.sibling(node_59, 2);

										Button(node_60, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Rename');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_35);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form_1);
							$.event('submit', form_1, handle_rename);
							$.append($$anchor, fragment_34);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_33);
			},
			$$slots: { default: true }
		});
	});

	var node_61 = $.sibling(node_55, 2);

	ConnectDomain(node_61, {
		get site() {
			return $.get(current_site);
		},
		onconnected: () => self.invalidate_lists({ collection_name: 'sites' }),
		get open() {
			return $.get(is_assign_domain_open);
		},

		set open($$value) {
			$.set(is_assign_domain_open, $$value, true);
		}
	});

	var node_62 = $.sibling(node_61, 2);

	$.component(node_62, () => AlertDialog.Root, ($$anchor, AlertDialog_Root_1) => {
		AlertDialog_Root_1($$anchor, {
			get open() {
				return $.get(is_delete_site_open);
			},

			set open($$value) {
				$.set(is_delete_site_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_36 = $.comment();
				var node_63 = $.first_child(fragment_36);

				$.component(node_63, () => AlertDialog.Content, ($$anchor, AlertDialog_Content_1) => {
					AlertDialog_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_37 = root_7();
							var node_64 = $.first_child(fragment_37);

							$.component(node_64, () => AlertDialog.Header, ($$anchor, AlertDialog_Header_1) => {
								AlertDialog_Header_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_38 = root_7();
										var node_65 = $.first_child(fragment_38);

										$.component(node_65, () => AlertDialog.Title, ($$anchor, AlertDialog_Title_1) => {
											AlertDialog_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Are you sure?');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});
										});

										var node_66 = $.sibling(node_65, 2);

										$.component(node_66, () => AlertDialog.Description, ($$anchor, AlertDialog_Description_1) => {
											AlertDialog_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_39 = root_19();
													var strong_1 = $.sibling($.first_child(fragment_39));
													var text_16 = $.only_child(strong_1, true);

													$.next();
													$.template_effect(() => $.set_text(text_16, $.get(current_site)?.name));
													$.append($$anchor, fragment_39);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_38);
									},
									$$slots: { default: true }
								});
							});

							var node_67 = $.sibling(node_64, 2);

							$.component(node_67, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer_1) => {
								AlertDialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_40 = root_7();
										var node_68 = $.first_child(fragment_40);

										$.component(node_68, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel_1) => {
											AlertDialog_Cancel_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Cancel');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});
										});

										var node_69 = $.sibling(node_68, 2);

										$.component(node_69, () => AlertDialog.Action, ($$anchor, AlertDialog_Action_1) => {
											AlertDialog_Action_1($$anchor, {
												onclick: delete_site,
												class: 'bg-red-600 hover:bg-red-700',
												children: ($$anchor, $$slotProps) => {
													var fragment_41 = $.comment();
													var node_70 = $.first_child(fragment_41);

													{
														var consequent_6 = ($$anchor) => {
															var div_13 = root_15();
															var node_71 = $.child(div_13);

															Loader(node_71, {});
															$.reset(div_13);
															$.append($$anchor, div_13);
														};

														var alternate_3 = ($$anchor) => {
															var text_18 = $.text();

															$.template_effect(() => $.set_text(text_18, `Delete ${$.get(current_site)?.name ?? ''}`));
															$.append($$anchor, text_18);
														};

														$.if(node_70, ($$render) => {
															if ($.get(deleting_site)) $$render(consequent_6); else $$render(alternate_3, -1);
														});
													}

													$.append($$anchor, fragment_41);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_40);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_37);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_36);
			},
			$$slots: { default: true }
		});
	});

	var node_72 = $.sibling(node_62, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_14 = root_20();
			var node_73 = $.child(div_14);

			CreateSite(node_73, {
				oncreated: () => {
					// The site was created server-side via the clone-site endpoint —
					// an out-of-band write the Sites cache doesn't know about — so
					// invalidate the cached lists to re-fetch and show the new card
					// without a full reload.
					self.invalidate_lists({ collection_name: 'sites' });

					$.set(is_creating_site, false);
				},

				oncancel: () => {
					$.set(is_creating_site, false);
				}
			});

			$.reset(div_14);
			$.append($$anchor, div_14);
		};

		$.if(node_72, ($$render) => {
			if ($.get(is_creating_site)) $$render(consequent_7);
		});
	}

	$.template_effect(() => $.set_text(text_3, $.get(active_site_group)?.name));
	$.append($$anchor, fragment_11);
	$.pop();
}