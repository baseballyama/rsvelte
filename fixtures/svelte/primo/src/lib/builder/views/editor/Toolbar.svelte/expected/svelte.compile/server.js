import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import { fade } from 'svelte/transition';
import { find as _find } from 'lodash-es';
import Icon from '@iconify/svelte';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-svelte';
import ToolbarButton from './ToolbarButton.svelte';
import { PrimoButton } from '$lib/builder/components/buttons';
import { mod_key_held } from '$lib/builder/stores/app/misc';
import { onNavigate, goto } from '$app/navigation';
import * as Avatar from '$lib/components/ui/avatar/index.js';
import { page, page as pageState } from '$app/state';
import { PageTypes, SiteSnapshots } from '$lib/pocketbase/collections';
import { onModKey } from '$lib/builder/utils/keyboard';
import { is_host_assigned } from '$lib/site_host';
import * as Popover from '$lib/components/ui/popover/index.js';
import SiteEditor from '$lib/builder/views/modal/SiteEditor/SiteEditor.svelte';
import SitePages from '$lib/builder/views/modal/SitePages/SitePages.svelte';
import PageTypeModal from '$lib/builder/views/modal/PageTypeModal/PageTypeModal.svelte';
import Collaboration from '$lib/builder/views/modal/Collaboration.svelte';
import Deploy from '$lib/components/Modals/Deploy/Deploy.svelte';
import ConnectDomain from '$lib/components/ConnectDomain.svelte';
import { usePublishSite } from '$lib/workers/Publish.svelte';
import { site_context } from '$lib/builder/stores/context';
import { current_user } from '$lib/pocketbase/user';
import { resolve_page, build_cms_page_url } from '$lib/pages';
import { self } from '$lib/pocketbase/managers';
import { getUserActivity } from '$lib/UserActivity.svelte';
import { useSiteSnapshot } from '$lib/Snapshot.svelte';
import { Snapshot } from '$lib/common/models/Snapshot';
import { instance } from '$lib/instance';

export default function Toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const { value: site } = site_context.get();
		const homepage = $.derived(() => site.homepage());
		const active_page_path = $.derived(() => pageState.params.page?.split('/'));
		const active_page = $.derived(() => active_page_path() ? resolve_page(site, active_page_path()) : homepage());
		const active_page_page_type = $.derived(() => active_page() && PageTypes.one(active_page().page_type));
		const active_page_type_id = $.derived(() => pageState.params.page_type);
		const active_page_type = $.derived(() => active_page_type_id() && PageTypes.one(active_page_type_id()));
		const publish = $.derived(() => usePublishSite(site?.id));
		const existing_snapshots = $.derived(() => SiteSnapshots.list({ filter: { site: site.id }, sort: '-created' }));
		const create_snapshot = $.derived(() => useSiteSnapshot({ source_site_id: site?.id }));
		let publish_in_progress = false;

		async function handle_publish() {
			publish_in_progress = true;

			try {
				await publish().run();

				// Create new snapshot and remove all other ones
				// TODO: The amount of snapshots could be larger once make UI for managing and restoring them
				const snapshots_to_remove = [...existing_snapshots() ?? []];

				const snapshot = await create_snapshot().run();

				SiteSnapshots.create({ site: site.id, file: Snapshot.encode(snapshot) });

				for (const existing_snapshot of snapshots_to_remove) {
					SiteSnapshots.delete(existing_snapshot.id);
				}

				await self.commit();
			} finally {
				publish_in_progress = false;
			}
		}

		let going_up = false;
		let going_down = false;
		const all_pages = $.derived(() => site?.pages() ?? []);

		const pages_at_current_level = $.derived(() => {
			if (!active_page() || !homepage()) return [];

			if (active_page().id === homepage().id || active_page().parent === homepage().id) return [
				homepage(),
				...all_pages().filter((p) => p.parent === homepage().id)
			].sort((a, b) => b.index - a.index); // home page or direct sibling (descending order)

			return all_pages().filter((p) => p.parent === active_page()?.parent).sort((a, b) => b.index - a.index); // standard children (descending order)
		});

		const can_navigate_up = $.derived(() => active_page() ? active_page().index > 0 : false);

		const can_navigate_down = $.derived(() => active_page()
			? active_page().index < pages_at_current_level().length - 1
			: false);

		// Navigation functions
		function navigate_up() {
			if (!can_navigate_up() || !active_page()) return;

			going_up = true;

			const prev_page = pages_at_current_level().find((p) => p.index === active_page().index - 1);

			if (!prev_page) return;

			const url = build_cms_page_url(prev_page, pageState.url);

			if (url) goto(url, { replaceState: false });

			setTimeout(() => going_up = false, 150);
		}

		function navigate_down() {
			if (!can_navigate_down() || !active_page()) return;

			going_down = true;

			const next_page = pages_at_current_level().find((p) => p.index === active_page().index + 1);

			if (!next_page) return;

			const url = build_cms_page_url(next_page, pageState.url);

			if (url) goto(url, { replaceState: false });

			setTimeout(() => going_down = false, 150);
		}

		let page_dropdown_anchor = null;
		let editing_site = false;
		let site_has_unsaved_changes = false;
		let editing_pages = false;
		let editing_page_types = false;
		let editing_collaborators = false;
		let publishing = false;
		let publish_stage = 'INITIAL';
		let connect_domain_open = false;

		// Close all dialogs on navigation
		onNavigate(() => {
			editing_pages = false;
			editing_page_types = false;
			publishing = false;
			publish_stage = 'INITIAL';
		});

		// workaround for what seems to be a runed PressedKeys bugs when holding mod and pressing up/down keys
		function handleGlobalKeydown(e) {
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

			if (!(isMac ? e.metaKey : e.ctrlKey)) return;

			if (e.key === 'ArrowUp') {
				e.preventDefault();
				navigate_up();
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				navigate_down();
			}
		}

		// Add the global listener on mount
		onModKey('p', () => {
			publishing = true;
		});

		const user_activities = $.derived(getUserActivity);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					onOpenChange: (open) => {
						if (!open) {
							if (site_has_unsaved_changes) {
								if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
									editing_site = true;

									return;
								}
							}

							self.discard();
						}
					},

					get open() {
						return editing_site;
					},

					set open($$value) {
						editing_site = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-999 w-[calc(100vw-1rem)] max-w-none h-[calc(100vh-1rem)] max-h-none flex flex-col p-4',
								children: ($$renderer) => {
									SiteEditor($$renderer, {
										onClose: () => editing_site = false,
										get has_unsaved_changes() {
											return site_has_unsaved_changes;
										},

										set has_unsaved_changes($$value) {
											site_has_unsaved_changes = $$value;
											$$settled = false;
										}
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

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return editing_pages;
					},

					set open($$value) {
						editing_pages = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-999 max-w-[900px] h-[calc(100vh-1rem)] max-h-none flex flex-col p-4',
								children: ($$renderer) => {
									SitePages($$renderer, {});
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
						return editing_page_types;
					},

					set open($$value) {
						editing_page_types = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-999 max-w-[900px] h-[calc(100vh-1rem)] max-h-none flex flex-col p-4',
								children: ($$renderer) => {
									PageTypeModal($$renderer, {});
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
						return editing_collaborators;
					},

					set open($$value) {
						editing_collaborators = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-999 max-w-[600px] flex flex-col p-4',
								children: ($$renderer) => {
									Collaboration($$renderer, { site });
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
					onOpenChange: (open) => {
						if (!open) {
							// Reset the state
							publish_stage = 'INITIAL';
						}
					},

					get open() {
						return publishing;
					},

					set open($$value) {
						publishing = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'z-[999] max-w-[500px] flex flex-col p-0',
								children: ($$renderer) => {
									Deploy($$renderer, {
										publish_fn: handle_publish,
										loading: publish_in_progress,
										site_host: site && is_host_assigned(site) ? site.host : '',
										onConnectDomain: () => {
											publishing = false;
											publish_stage = 'INITIAL';
											connect_domain_open = true;
										},

										onClose: () => {
											publishing = false;
											publish_stage = 'INITIAL';
										},

										get stage() {
											return publish_stage;
										},

										set stage($$value) {
											publish_stage = $$value;
											$$settled = false;
										}
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

			$$renderer.push(` `);

			ConnectDomain($$renderer, {
				site,
				get open() {
					return connect_domain_open;
				},

				set open($$value) {
					connect_domain_open = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <nav aria-label="toolbar" id="primo-toolbar" class="svelte-1105vux"><div class="menu-container svelte-1105vux"><div class="left svelte-1105vux">`);

			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.serverRole) {
				$$renderer.push('<!--[0-->');
				PrimoButton($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="button-group svelte-1105vux"><div class="flex rounded" style="border: 1px solid #222">`);
			ToolbarButton($$renderer, { label: 'Site', icon: 'gg:website' });
			$$renderer.push(`<!----></div></div> <div class="button-group svelte-1105vux">`);

			if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)) {
				$$renderer.push(`<!--[0--><div class="page-hotkeys svelte-1105vux"><div${$.attr_style('', {
					color: going_up ? 'var(--primo-primary-color)' : 'inherit',
					opacity: can_navigate_up() ? 1 : 0.3
				})}>⌘ ↑</div> <div${$.attr_style('', {
					color: going_down ? 'var(--primo-primary-color)' : 'inherit',
					opacity: can_navigate_down() ? 1 : 0.3
				})}>⌘ ↓</div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="flex rounded" style="border: 1px solid #222">`);
				ToolbarButton($$renderer, { label: 'Pages', icon: 'iconoir:multiple-pages' });
				$$renderer.push(`<!----> `);

				if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer' || $.store_get($$store_subs ??= {}, '$current_user', current_user)?.serverRole === 'developer') {
					$$renderer.push('<!--[0-->');

					if (DropdownMenu.Root) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										$$renderer.push(`<button${$.attributes(
											{
												...props,
												class: 'hover:bg-[var(--primo-color-codeblack)]',
												style: 'border-left: 1px solid #222'
											},
											'svelte-1105vux'
										)}>`);

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
										side: 'bottom',
										class: 'z-[999]',
										align: 'start',
										sideOffset: 4,
										customAnchor: page_dropdown_anchor,
										children: ($$renderer) => {
											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													onclick: () => editing_page_types = true,
													class: 'text-xs cursor-pointer',
													children: ($$renderer) => {
														Icon($$renderer, { icon: 'lucide:layout-template', style: 'width: .75rem' });
														$$renderer.push(`<!----> <span>Page Types</span>`);
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
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="site-name svelte-1105vux"><span class="site svelte-1105vux">${$.escape(site?.name)}</span> `);

			if (active_page_type()) {
				$$renderer.push(`<!--[0--><span class="separator svelte-1105vux">/</span> <div class="page-type svelte-1105vux"${$.attr_style('', { background: active_page_type().color })}>`);
				Icon($$renderer, { icon: active_page_type().icon });
				$$renderer.push(`<!----> <span>${$.escape(active_page_type().name)}</span></div>`);
			} else if (active_page()) {
				$$renderer.push(`<!--[1--><span class="separator svelte-1105vux">/</span> <span class="page svelte-1105vux">${$.escape(active_page().name)}</span> `);

				if (active_page_page_type()) {
					$$renderer.push('<!--[0-->');

					if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
						$$renderer.push('<!--[0-->');

						const base_path = pageState.url.pathname.includes('/sites/') ? `/admin/sites/${site?.id}` : '/admin/site';

						$$renderer.push(`<a class="page-type-badge svelte-1105vux"${$.attr_style(`background-color: ${$.stringify(active_page_page_type().color)};`)}${$.attr('href', `${base_path}/page-type--${$.stringify(active_page_page_type().id)}`)}>`);
						Icon($$renderer, { icon: active_page_page_type().icon });
						$$renderer.push(`<!----></a>`);
					} else {
						$$renderer.push(`<!--[-1--><span class="page-type-badge svelte-1105vux"${$.attr_style(`background-color: ${$.stringify(active_page_page_type().color)};`)}>`);
						Icon($$renderer, { icon: active_page_page_type().icon });
						$$renderer.push(`<!----></span>`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="right svelte-1105vux"><div class="flex -space-x-1"><!--[-->`);

			const each_array = $.ensure_array_like(user_activities());

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let activities = each_array[$$index_1];
				const { user, user_avatar } = activities[0];

				$$renderer.push(`<div class="flex">`);

				if (Popover.Root) {
					$$renderer.push('<!--[-->');

					Popover.Root($$renderer, {
						children: ($$renderer) => {
							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');

								Popover.Trigger($$renderer, {
									children: ($$renderer) => {
										if (Avatar.Root) {
											$$renderer.push('<!--[-->');

											Avatar.Root($$renderer, {
												class: 'ring-background transition-all ring-2 size-[27px]',
												children: ($$renderer) => {
													if (user_avatar) {
														$$renderer.push('<!--[0-->');

														if (Avatar.Image) {
															$$renderer.push('<!--[-->');

															Avatar.Image($$renderer, {
																src: user_avatar,
																alt: user.name || user.email,
																class: 'grayscale hover:grayscale-0 object-cover object-center'
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

													if (Avatar.Fallback) {
														$$renderer.push('<!--[-->');

														Avatar.Fallback($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape((user.name || user.email).slice(0, 2).toUpperCase())}`);
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

							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									class: 'w-auto z-[99]',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex space-x-4">`);

										if (Avatar.Root) {
											$$renderer.push('<!--[-->');

											Avatar.Root($$renderer, {
												class: 'data-[status=loaded]:border-foreground bg-muted text-muted-foreground h-12 w-12 rounded-full border border-transparent text-[17px] font-medium uppercase',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent">`);

													if (user_avatar) {
														$$renderer.push('<!--[0-->');

														if (Avatar.Image) {
															$$renderer.push('<!--[-->');

															Avatar.Image($$renderer, {
																src: user_avatar,
																alt: user.name || user.email,
																class: 'object-cover object-center'
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

													if (Avatar.Fallback) {
														$$renderer.push('<!--[-->');

														Avatar.Fallback($$renderer, {
															class: 'border-muted border',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape((user.name || user.email).slice(0, 2).toUpperCase())}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(`</div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <div class="space-y-1 text-sm"><h4 class="font-medium">${$.escape(user.name || user.email)}</h4> <!--[-->`);

										const each_array_1 = $.ensure_array_like(activities);

										for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
											let {
												page,
												page_type_url,
												page_url,
												page_type,
												page_page_type,
												site_symbol
											} = each_array_1[$$index];

											$$renderer.push(`<div class="flex items-center gap-1">`);

											if (site_symbol) {
												$$renderer.push('<!--[0-->');
												Icon($$renderer, { icon: 'lucide:cuboid' });
												$$renderer.push(`<!----> <p>${$.escape(site_symbol.name)}</p>`);
											} else if (page && page_page_type) {
												$$renderer.push('<!--[1-->');
												Icon($$renderer, { icon: page_page_type.icon });
												$$renderer.push(`<!----> <a${$.attr('href', page_url?.href)} class="underline">${$.escape(page.name)}</a>`);
											} else if (page_type) {
												$$renderer.push('<!--[2-->');
												Icon($$renderer, { icon: page_type.icon });
												$$renderer.push(`<!----> <a${$.attr('href', page_type_url?.href)} class="underline">${$.escape(page_type.name)}</a>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></div>`);
										}

										$$renderer.push(`<!--]--></div></div>`);
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

				$$renderer.push(`</div>`);
			}

			$$renderer.push(`<!--]--></div> <div id="primo-dev-indicator-slot"></div> `);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<button${$.attributes({ ...props, class: 'more-menu-button' }, 'svelte-1105vux')}>`);
								Icon($$renderer, { icon: 'mdi:dots-vertical' });
								$$renderer.push(`<!----></button>`);
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
								side: 'bottom',
								class: 'z-[999]',
								align: 'end',
								sideOffset: 4,
								children: ($$renderer) => {
									if (!instance.dev_mode && $.store_get($$store_subs ??= {}, '$current_user', current_user)?.serverRole) {
										$$renderer.push('<!--[0-->');

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												onclick: () => editing_collaborators = true,
												class: 'text-xs cursor-pointer',
												children: ($$renderer) => {
													Icon($$renderer, { icon: 'clarity:users-solid', style: 'width: .75rem' });
													$$renderer.push(`<!----> <span>Collaborators</span>`);
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
											onclick: async () => {
												self.instance?.authStore.clear();
												await goto('/admin/auth');
											},
											class: 'text-xs cursor-pointer',
											children: ($$renderer) => {
												Icon($$renderer, { icon: 'mdi:logout', style: 'width: .75rem' });
												$$renderer.push(`<!----> <span>Log out</span>`);
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
			children?.($$renderer);
			$$renderer.push(`<!----> `);

			ToolbarButton($$renderer, {
				type: 'primo',
				icon: instance.dev_mode ? 'lucide:eye' : 'entypo:publish',
				label: instance.dev_mode ? 'Preview' : 'Publish',
				key: 'p',
				loading: publish_in_progress
			});

			$$renderer.push(`<!----></div></div></nav>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}