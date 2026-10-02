import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const sidebar = useSidebar();
		const site_group_id = $.derived(() => page.url.searchParams.get('group'));
		const site_groups = $.derived(() => SiteGroups.list() ?? []);
		const active_site_group = $.derived(() => site_group_id() ? SiteGroups.one(site_group_id()) : undefined);
		const all_sites = $.derived(() => Sites.list() ?? []);

		const sites = $.derived(() => site_group_id()
			? all_sites().filter((site) => site.group === site_group_id())
			: []);

		// Plan site cap: 0/undefined means unlimited. Enforced server-side in
		// internal/limits.go; this just disables the affordance + shows usage.
		const at_site_cap = $.derived(() => !!instance.site_cap && all_sites().length >= instance.site_cap);

		let is_rename_group_open = false;
		let new_group_name = '';

		async function handle_group_rename(e) {
			e.preventDefault();

			if (!active_site_group()) return;

			SiteGroups.update(active_site_group().id, { name: new_group_name });
			await self.commit();
			is_rename_group_open = false;
		}

		let is_delete_group_open = false;
		let deleting_group = false;

		async function handle_group_delete() {
			deleting_group = true;

			if (!active_site_group()) return;

			SiteGroups.delete(active_site_group().id);
			await self.commit();
			deleting_group = false;
			is_delete_group_open = false;
		}

		let download_site_id = null;
		let download_site_name = null;
		let downloading = false;

		const snapshot_worker = $.derived(() => download_site_id
			? useSiteSnapshot({ source_site_id: download_site_id })
			: null);

		function download_site_file(site) {
			download_site_id = site.id;
			download_site_name = site.name;
		}

		let is_rename_site_open = false;
		let new_site_name = '';
		let current_site = null;

		async function handle_rename() {
			if (!current_site) return;

			Sites.update(current_site.id, { name: new_site_name });
			await self.commit();
			is_rename_site_open = false;
		}

		// Connect-a-domain flow lives in the reusable ConnectDomain component; the
		// dashboard just opens it for the selected site.
		let is_assign_domain_open = false;

		let is_delete_site_open = false;
		let deleting_site = false;

		async function delete_site() {
			if (!current_site) return;

			deleting_site = true;

			try {
				const siteId = current_site.id;

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
				is_delete_site_open = false;
			} catch(error) {
				if (error instanceof ClientResponseError && error.status === 404) {
					// Site already deleted - treat as success
					is_delete_site_open = false;
				} else {
					console.error('Error deleting site:', error);
				}
			} finally {
				deleting_site = false;
			}
		}

		let is_move_site_open = false;
		let selected_group_id = site_groups()[0]?.id ?? '';

		async function move_site() {
			if (!current_site) return;

			Sites.update(current_site.id, { group: selected_group_id });
			await self.commit();
			is_move_site_open = false;
		}

		let is_creating_site = false;

		function SiteButton($$renderer, site) {
			$$renderer.push(`<div class="space-y-3 relative w-full bg-[#111]"><div class="rounded-tl rounded-tr overflow-hidden"><a${$.attr('href', site_editor_url(site))}>`);
			SitePreview($$renderer, { site });
			$$renderer.push(`<!----></a></div> <div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-[#111] truncate flex items-center justify-between"><div class="flex flex-col gap-1" style="max-width: calc(100% - 2rem)"><a${$.attr('href', site_editor_url(site))} class="text-sm font-medium leading-none truncate">${$.escape(site.name)}</a> <p class="text-xs text-muted-foreground leading-tight truncate">${$.escape(is_host_assigned(site) ? site.host : 'Unassigned')}</p></div> `);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (DropdownMenu.Trigger) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Trigger($$renderer, {
								class: 'p-2 hover:bg-[#222] rounded-md',
								children: ($$renderer) => {
									EllipsisVertical($$renderer, { size: 14 });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								children: ($$renderer) => {
									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => {
												current_site = site;
												is_rename_site_open = true;
											},

											children: ($$renderer) => {
												SquarePen($$renderer, { class: 'h-4 w-4' });
												$$renderer.push(`<!----> <span>Rename</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => {
												current_site = site;
												is_assign_domain_open = true;
											},

											children: ($$renderer) => {
												Globe($$renderer, { class: 'h-4 w-4' });
												$$renderer.push(`<!----> <span>${$.escape(is_host_assigned(site) ? 'Change domain' : 'Assign domain')}</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (site_groups().length > 1) {
										$$renderer.push('<!--[0-->');

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												onclick: () => {
													current_site = site;
													is_move_site_open = true;
												},

												children: ($$renderer) => {
													ArrowLeftRight($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> <span>Move</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => download_site_file(site),
											disabled: downloading && download_site_id === site.id,
											children: ($$renderer) => {
												if (downloading && download_site_id === site.id) {
													$$renderer.push('<!--[0-->');
													Loader($$renderer, { class: 'h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> <span>Downloading...</span>`);
												} else {
													$$renderer.push('<!--[-1-->');
													Download($$renderer, { class: 'h-4 w-4' });
													$$renderer.push(`<!----> <span>Download</span>`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => {
												current_site = site;
												is_delete_site_open = true;
											},
											class: 'text-red-500 hover:text-red-600 focus:text-red-600',
											children: ($$renderer) => {
												Trash2($$renderer, { class: 'h-4 w-4' });
												$$renderer.push(`<!----> <span>Delete</span>`);
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

			$$renderer.push(`</div></div>`);
		}

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
			$$renderer.push(`<!----> <div class="text-sm">${$.escape(active_site_group()?.name)}</div> `);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<button${$.attributes({ ...props })}>`);
								ChevronDown($$renderer, { class: 'h-4' });
								$$renderer.push(`<!----> <span class="sr-only">More</span></button>`);
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');
								DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								class: 'w-56 rounded-lg',
								side: 'bottom',
								align: sidebar.isMobile ? 'end' : 'start',
								children: ($$renderer) => {
									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => is_rename_group_open = true,
											children: ($$renderer) => {
												SquarePen($$renderer, { class: 'text-muted-foreground' });
												$$renderer.push(`<!----> <span>Rename</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (site_groups()?.length) {
										$$renderer.push('<!--[0-->');

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												onclick: () => is_delete_group_open = true,
												children: ($$renderer) => {
													Trash2($$renderer, { class: 'text-muted-foreground' });
													$$renderer.push(`<!----> <span>Delete</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
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

			$$renderer.push(`</div> <div class="ml-auto mr-4 flex items-center gap-3">`);

			if (instance.site_cap) {
				$$renderer.push(`<!--[0--><span class="text-xs text-muted-foreground">${$.escape(all_sites().length)} of ${$.escape(instance.site_cap)} sites</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'outline',
				disabled: at_site_cap(),
				title: at_site_cap()
					? 'Site limit reached for your plan. Upgrade to add more sites.'
					: undefined,
				onclick: () => is_creating_site = true,
				children: ($$renderer) => {
					CirclePlus($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!----> Create Site`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></header> <div class="flex flex-1 flex-col gap-4 px-4 pb-4">`);

			if (sites()?.length) {
				$$renderer.push(`<!--[0--><div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><!--[-->`);

				const each_array = $.ensure_array_like(sites());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let site = each_array[$$index];

					SiteButton($$renderer, site);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				EmptyState($$renderer, {
					class: 'h-[50vh]',
					icon: Globe,
					title: 'No Sites to display',
					description: 'It looks like you haven\'t created any websites yet.'
				});
			}

			$$renderer.push(`<!--]--></div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_rename_group_open;
					},

					set open($$value) {
						is_rename_group_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename group</h2> <p class="text-muted-foreground text-sm">Enter a new name for your group</p> <form>`);

									Input($$renderer, {
										placeholder: 'Enter new group name',
										class: 'my-4',
										get value() {
											return new_group_name;
										},

										set value($$value) {
											new_group_name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => is_rename_group_open = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Rename`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</form>`);
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

			$$renderer.push(` `);

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return is_delete_group_open;
					},

					set open($$value) {
						is_delete_group_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure?`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->This action cannot be undone. This will permanently delete <strong>${$.escape(active_site_group()?.name)}</strong> and <strong>all</strong> its sites.`);
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

									$$renderer.push(` `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: handle_group_delete,
														class: 'bg-red-600 hover:bg-red-700',
														children: ($$renderer) => {
															if (deleting_group) {
																$$renderer.push(`<!--[0--><div class="animate-spin absolute">`);
																Loader($$renderer, {});
																$$renderer.push(`<!----></div>`);
															} else {
																$$renderer.push(`<!--[-1-->Delete ${$.escape(active_site_group()?.name)}`);
															}

															$$renderer.push(`<!--]-->`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_move_site_open;
					},

					set open($$value) {
						is_move_site_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<div class="grid gap-4"><div class="space-y-2"><h4 class="font-medium leading-none">Move to group</h4> <p class="text-muted-foreground text-sm">Select a group for this site</p></div> `);

									if (RadioGroup.Root) {
										$$renderer.push('<!--[-->');

										RadioGroup.Root($$renderer, {
											get value() {
												return selected_group_id;
											},

											set value($$value) {
												selected_group_id = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_1 = $.ensure_array_like(site_groups());

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let group = each_array_1[$$index_1];

													$$renderer.push(`<div class="flex items-center space-x-2">`);

													if (RadioGroup.Item) {
														$$renderer.push('<!--[-->');
														RadioGroup.Item($$renderer, { value: group.id, id: group.id });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Label($$renderer, {
														for: group.id,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(group.name)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="flex justify-end">`);

									Button($$renderer, {
										onclick: move_site,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Move`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div>`);
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

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return is_rename_site_open;
					},

					set open($$value) {
						is_rename_site_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Site</h2> <p class="text-muted-foreground text-sm">Enter a new name for your site</p> <form>`);

									Input($$renderer, {
										placeholder: 'Enter new site name',
										class: 'my-4',
										get value() {
											return new_site_name;
										},

										set value($$value) {
											new_site_name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => is_rename_site_open = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Rename`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</form>`);
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

			$$renderer.push(` `);

			ConnectDomain($$renderer, {
				site: current_site,
				onconnected: () => self.invalidate_lists({ collection_name: 'sites' }),
				get open() {
					return is_assign_domain_open;
				},

				set open($$value) {
					is_assign_domain_open = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return is_delete_site_open;
					},

					set open($$value) {
						is_delete_site_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure?`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->This action cannot be undone. This will permanently delete <strong>${$.escape(current_site?.name)}</strong> and remove all associated data.`);
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

									$$renderer.push(` `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: delete_site,
														class: 'bg-red-600 hover:bg-red-700',
														children: ($$renderer) => {
															if (deleting_site) {
																$$renderer.push(`<!--[0--><div class="animate-spin absolute">`);
																Loader($$renderer, {});
																$$renderer.push(`<!----></div>`);
															} else {
																$$renderer.push(`<!--[-1-->Delete ${$.escape(current_site?.name)}`);
															}

															$$renderer.push(`<!--]-->`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (is_creating_site) {
				$$renderer.push(`<!--[0--><div class="fixed inset-0 z-50 bg-background overflow-auto">`);

				CreateSite($$renderer, {
					oncreated: () => {
						// The site was created server-side via the clone-site endpoint —
						// an out-of-band write the Sites cache doesn't know about — so
						// invalidate the cached lists to re-fetch and show the new card
						// without a full reload.
						self.invalidate_lists({ collection_name: 'sites' });

						is_creating_site = false;
					},

					oncancel: () => {
						is_creating_site = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}