import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="page-hotkeys svelte-1105vux"><div>&#8984; ↑</div> <div>&#8984; ↓</div></div>`);
var root_1 = $.from_html(`<button><!> <span class="sr-only">More</span></button>`);
var root_2 = $.from_html(`<!> <span>Page Types</span>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex rounded" style="border: 1px solid #222"><!> <!></div>`);
var root_5 = $.from_html(`<span class="separator svelte-1105vux">/</span> <div class="page-type svelte-1105vux"><!> <span> </span></div>`, 1);
var root_6 = $.from_html(`<a class="page-type-badge svelte-1105vux"><!></a>`);
var root_7 = $.from_html(`<span class="page-type-badge svelte-1105vux"><!></span>`);
var root_8 = $.from_html(`<span class="separator svelte-1105vux">/</span> <span class="page svelte-1105vux"> </span> <!>`, 1);
var root_9 = $.from_html(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent"><!> <!></div>`);
var root_10 = $.from_html(`<!> <p> </p>`, 1);
var root_11 = $.from_html(`<!> <a class="underline"> </a>`, 1);
var root_12 = $.from_html(`<div class="flex items-center gap-1"><!></div>`);
var root_13 = $.from_html(`<div class="flex space-x-4"><!> <div class="space-y-1 text-sm"><h4 class="font-medium"> </h4> <!></div></div>`);
var root_14 = $.from_html(`<div class="flex"><!></div>`);
var root_15 = $.from_html(`<button><!></button>`);
var root_16 = $.from_html(`<!> <span>Collaborators</span>`, 1);
var root_17 = $.from_html(`<!> <span>Log out</span>`, 1);
var root_18 = $.from_html(`<!> <!> <!> <!> <!> <!> <nav aria-label="toolbar" id="primo-toolbar" class="svelte-1105vux"><div class="menu-container svelte-1105vux"><div class="left svelte-1105vux"><!> <div class="button-group svelte-1105vux"><div class="flex rounded" style="border: 1px solid #222"><!></div></div> <div class="button-group svelte-1105vux"><!></div></div> <div class="site-name svelte-1105vux"><span class="site svelte-1105vux"> </span> <!></div> <div class="right svelte-1105vux"><div class="flex -space-x-1"></div> <div id="primo-dev-indicator-slot"></div> <!> <!> <!></div></div></nav>`, 1);

export default function Toolbar($$anchor, $$props) {
	$.push($$props, true);

	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { value: site } = site_context.get();
	const homepage = $.derived(() => site.homepage());
	const active_page_path = $.derived(() => pageState.params.page?.split('/'));

	const active_page = $.derived(() => $.get(active_page_path)
		? resolve_page(site, $.get(active_page_path))
		: $.get(homepage));

	const active_page_page_type = $.derived(() => $.get(active_page) && PageTypes.one($.get(active_page).page_type));
	const active_page_type_id = $.derived(() => pageState.params.page_type);
	const active_page_type = $.derived(() => $.get(active_page_type_id) && PageTypes.one($.get(active_page_type_id)));
	const publish = $.derived(() => usePublishSite(site?.id));
	const existing_snapshots = $.derived(() => SiteSnapshots.list({ filter: { site: site.id }, sort: '-created' }));
	const create_snapshot = $.derived(() => useSiteSnapshot({ source_site_id: site?.id }));
	let publish_in_progress = $.state(false);

	async function handle_publish() {
		$.set(publish_in_progress, true);

		try {
			await $.get(publish).run();

			// Create new snapshot and remove all other ones
			// TODO: The amount of snapshots could be larger once make UI for managing and restoring them
			const snapshots_to_remove = [...$.get(existing_snapshots) ?? []];

			const snapshot = await $.get(create_snapshot).run();

			SiteSnapshots.create({ site: site.id, file: Snapshot.encode(snapshot) });

			for (const existing_snapshot of snapshots_to_remove) {
				SiteSnapshots.delete(existing_snapshot.id);
			}

			await self.commit();
		} finally {
			$.set(publish_in_progress, false);
		}
	}

	let going_up = $.state(false);
	let going_down = $.state(false);
	const all_pages = $.derived(() => site?.pages() ?? []);

	const pages_at_current_level = $.derived(() => {
		if (!$.get(active_page) || !$.get(homepage)) return [];

		if ($.get(active_page // home page or direct sibling (descending order)
		).id === $.get(homepage).id || $.get(active_page).parent === $.get(homepage).id) return [
			$.get(homepage),
			...$.get(all_pages).filter((p) => p.parent === $.get(homepage).id)
		].sort((a, b) => b.index - a.index);

		return $.get(all_pages // standard children (descending order)
		).filter((p) => p.parent === $.get(active_page)?.parent).sort((a, b) => b.index - a.index);
	});

	const can_navigate_up = $.derived(() => $.get(active_page) ? $.get(active_page).index > 0 : false);

	const can_navigate_down = $.derived(() => $.get(active_page)
		? $.get(active_page).index < $.get(pages_at_current_level).length - 1
		: false);

	// Navigation functions
	function navigate_up() {
		if (!$.get(can_navigate_up) || !$.get(active_page)) return;

		$.set(going_up, true);

		const prev_page = $.get(pages_at_current_level).find((p) => p.index === $.get(active_page).index - 1);

		if (!prev_page) return;

		const url = build_cms_page_url(prev_page, pageState.url);

		if (url) goto(url, { replaceState: false });

		setTimeout(() => $.set(going_up, false), 150);
	}

	function navigate_down() {
		if (!$.get(can_navigate_down) || !$.get(active_page)) return;

		$.set(going_down, true);

		const next_page = $.get(pages_at_current_level).find((p) => p.index === $.get(active_page).index + 1);

		if (!next_page) return;

		const url = build_cms_page_url(next_page, pageState.url);

		if (url) goto(url, { replaceState: false });

		setTimeout(() => $.set(going_down, false), 150);
	}

	let page_dropdown_anchor = $.state(null);
	let editing_site = $.state(false);
	let site_has_unsaved_changes = $.state(false);
	let editing_pages = $.state(false);
	let editing_page_types = $.state(false);
	let editing_collaborators = $.state(false);
	let publishing = $.state(false);
	let publish_stage = $.state('INITIAL');
	let connect_domain_open = $.state(false);

	// Close all dialogs on navigation
	onNavigate(() => {
		$.set(editing_pages, false);
		$.set(editing_page_types, false);
		$.set(publishing, false);
		$.set(publish_stage, 'INITIAL');
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
	$.user_effect(() => {
		window.addEventListener('keydown', handleGlobalKeydown);

		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	onModKey('p', () => {
		$.set(publishing, true);
	});

	const user_activities = $.derived(getUserActivity);
	var fragment = root_18();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			onOpenChange: (open) => {
				if (!open) {
					if ($.get(site_has_unsaved_changes)) {
						if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
							$.set(editing_site, true);

							return;
						}
					}

					self.discard();
				}
			},

			get open() {
				return $.get(editing_site);
			},

			set open($$value) {
				$.set(editing_site, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'z-999 w-[calc(100vw-1rem)] max-w-none h-[calc(100vh-1rem)] max-h-none flex flex-col p-4',
						children: ($$anchor, $$slotProps) => {
							SiteEditor($$anchor, {
								onClose: () => $.set(editing_site, false),
								get has_unsaved_changes() {
									return $.get(site_has_unsaved_changes);
								},

								set has_unsaved_changes($$value) {
									$.set(site_has_unsaved_changes, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(editing_pages);
			},

			set open($$value) {
				$.set(editing_pages, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				$.component(node_3, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'z-999 max-w-[900px] h-[calc(100vh-1rem)] max-h-none flex flex-col p-4',
						children: ($$anchor, $$slotProps) => {
							SitePages($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_2, 2);

	$.component(node_4, () => Dialog.Root, ($$anchor, Dialog_Root_2) => {
		Dialog_Root_2($$anchor, {
			get open() {
				return $.get(editing_page_types);
			},

			set open($$value) {
				$.set(editing_page_types, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_5 = $.first_child(fragment_5);

				$.component(node_5, () => Dialog.Content, ($$anchor, Dialog_Content_2) => {
					Dialog_Content_2($$anchor, {
						class: 'z-999 max-w-[900px] h-[calc(100vh-1rem)] max-h-none flex flex-col p-4',
						children: ($$anchor, $$slotProps) => {
							PageTypeModal($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_4, 2);

	$.component(node_6, () => Dialog.Root, ($$anchor, Dialog_Root_3) => {
		Dialog_Root_3($$anchor, {
			get open() {
				return $.get(editing_collaborators);
			},

			set open($$value) {
				$.set(editing_collaborators, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_7 = $.first_child(fragment_7);

				$.component(node_7, () => Dialog.Content, ($$anchor, Dialog_Content_3) => {
					Dialog_Content_3($$anchor, {
						class: 'z-999 max-w-[600px] flex flex-col p-4',
						children: ($$anchor, $$slotProps) => {
							Collaboration($$anchor, {
								get site() {
									return site;
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_6, 2);

	$.component(node_8, () => Dialog.Root, ($$anchor, Dialog_Root_4) => {
		Dialog_Root_4($$anchor, {
			onOpenChange: (open) => {
				if (!open) {
					// Reset the state
					$.set(publish_stage, 'INITIAL');
				}
			},

			get open() {
				return $.get(publishing);
			},

			set open($$value) {
				$.set(publishing, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_9 = $.comment();
				var node_9 = $.first_child(fragment_9);

				$.component(node_9, () => Dialog.Content, ($$anchor, Dialog_Content_4) => {
					Dialog_Content_4($$anchor, {
						class: 'z-[999] max-w-[500px] flex flex-col p-0',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => site && is_host_assigned(site) ? site.host : '');

								Deploy($$anchor, {
									publish_fn: handle_publish,
									get loading() {
										return $.get(publish_in_progress);
									},

									get site_host() {
										return $.get($0);
									},

									onConnectDomain: () => {
										$.set(publishing, false);
										$.set(publish_stage, 'INITIAL');
										$.set(connect_domain_open, true);
									},

									onClose: () => {
										$.set(publishing, false);
										$.set(publish_stage, 'INITIAL');
									},

									get stage() {
										return $.get(publish_stage);
									},

									set stage($$value) {
										$.set(publish_stage, $$value, true);
									}
								});
							}
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node_8, 2);

	ConnectDomain(node_10, {
		get site() {
			return site;
		},

		get open() {
			return $.get(connect_domain_open);
		},

		set open($$value) {
			$.set(connect_domain_open, $$value, true);
		}
	});

	var nav = $.sibling(node_10, 2);
	var div = $.child(nav);
	var div_1 = $.child(div);
	var node_11 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			PrimoButton($$anchor, {});
		};

		$.if(node_11, ($$render) => {
			if ($current_user()?.serverRole) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node_11, 2);
	var div_3 = $.child(div_2);
	var node_12 = $.child(div_3);

	ToolbarButton(node_12, {
		label: 'Site',
		icon: 'gg:website',
		$$events: { click: () => $.set(editing_site, true) }
	});

	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_13 = $.child(div_4);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root();
			var div_6 = $.child(div_5);
			let styles;
			var div_7 = $.sibling(div_6, 2);
			let styles_1;

			$.reset(div_5);

			$.template_effect(() => {
				styles = $.set_style(div_6, '', styles, {
					color: $.get(going_up) ? 'var(--primo-primary-color)' : 'inherit',
					opacity: $.get(can_navigate_up) ? 1 : 0.3
				});

				styles_1 = $.set_style(div_7, '', styles_1, {
					color: $.get(going_down) ? 'var(--primo-primary-color)' : 'inherit',
					opacity: $.get(can_navigate_down) ? 1 : 0.3
				});
			});

			$.append($$anchor, div_5);
		};

		var alternate = ($$anchor) => {
			var div_8 = root_4();
			var node_14 = $.child(div_8);

			ToolbarButton(node_14, {
				label: 'Pages',
				icon: 'iconoir:multiple-pages',
				$$events: { click: () => $.set(editing_pages, true) }
			});

			var node_15 = $.sibling(node_14, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_12 = $.comment();
					var node_16 = $.first_child(fragment_12);

					$.component(node_16, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
						DropdownMenu_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_13 = root_3();
								var node_17 = $.first_child(fragment_13);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;
										var button = root_1();

										$.attribute_effect(
											button,
											() => ({
												...props(),
												class: 'hover:bg-[var(--primo-color-codeblack)]',
												style: 'border-left: 1px solid #222'
											}),
											void 0,
											void 0,
											void 0,
											'svelte-1105vux'
										);

										var node_18 = $.child(button);

										ChevronDown(node_18, { class: 'h-4' });
										$.next(2);
										$.reset(button);
										$.append($$anchor, button);
									};

									$.component(node_17, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
										DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
									});
								}

								var node_19 = $.sibling(node_17, 2);

								$.component(node_19, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
									DropdownMenu_Content($$anchor, {
										side: 'bottom',
										class: 'z-[999]',
										align: 'start',
										sideOffset: 4,
										get customAnchor() {
											return $.get(page_dropdown_anchor);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_14 = $.comment();
											var node_20 = $.first_child(fragment_14);

											$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
												DropdownMenu_Item($$anchor, {
													onclick: () => $.set(editing_page_types, true),
													class: 'text-xs cursor-pointer',
													children: ($$anchor, $$slotProps) => {
														var fragment_15 = root_2();
														var node_21 = $.first_child(fragment_15);

														Icon(node_21, { icon: 'lucide:layout-template', style: 'width: .75rem' });
														$.next(2);
														$.append($$anchor, fragment_15);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_14);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_13);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_12);
				};

				$.if(node_15, ($$render) => {
					if ($current_user()?.siteRole === 'developer' || $current_user()?.serverRole === 'developer') $$render(consequent_2);
				});
			}

			$.reset(div_8);
			$.bind_this(div_8, ($$value) => $.set(page_dropdown_anchor, $$value), () => $.get(page_dropdown_anchor));
			$.append($$anchor, div_8);
		};

		$.if(node_13, ($$render) => {
			if ($mod_key_held()) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div_4);
	$.reset(div_1);

	var div_9 = $.sibling(div_1, 2);
	var span = $.child(div_9);
	var text = $.only_child(span, true);
	var node_22 = $.sibling(span, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_16 = root_5();
			var div_10 = $.sibling($.first_child(fragment_16), 2);
			let styles_2;
			var node_23 = $.child(div_10);

			Icon(node_23, {
				get icon() {
					return $.get(active_page_type).icon;
				}
			});

			var span_1 = $.sibling(node_23, 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(div_10);

			$.template_effect(() => {
				styles_2 = $.set_style(div_10, '', styles_2, { background: $.get(active_page_type).color });
				$.set_text(text_1, $.get(active_page_type).name);
			});

			$.append($$anchor, fragment_16);
		};

		var consequent_6 = ($$anchor) => {
			var fragment_17 = root_8();
			var span_2 = $.sibling($.first_child(fragment_17), 2);
			var text_2 = $.only_child(span_2, true);
			var node_24 = $.sibling(span_2, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_18 = $.comment();
					var node_25 = $.first_child(fragment_18);

					{
						var consequent_4 = ($$anchor) => {
							const base_path = $.derived(() => pageState.url.pathname.includes('/sites/') ? `/admin/sites/${site?.id}` : '/admin/site');
							var a_1 = root_6();
							var node_26 = $.child(a_1);

							Icon(node_26, {
								get icon() {
									return $.get(active_page_page_type).icon;
								}
							});

							$.reset(a_1);

							$.template_effect(() => {
								$.set_style(a_1, `background-color: ${$.get(active_page_page_type).color ?? ''};`);
								$.set_attribute(a_1, 'href', `${$.get(base_path) ?? ''}/page-type--${$.get(active_page_page_type).id ?? ''}`);
							});

							$.append($$anchor, a_1);
						};

						var alternate_1 = ($$anchor) => {
							var span_3 = root_7();
							var node_27 = $.child(span_3);

							Icon(node_27, {
								get icon() {
									return $.get(active_page_page_type).icon;
								}
							});

							$.reset(span_3);
							$.template_effect(() => $.set_style(span_3, `background-color: ${$.get(active_page_page_type).color ?? ''};`));
							$.append($$anchor, span_3);
						};

						$.if(node_25, ($$render) => {
							if ($current_user()?.siteRole === 'developer') $$render(consequent_4); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_18);
				};

				$.if(node_24, ($$render) => {
					if ($.get(active_page_page_type)) $$render(consequent_5);
				});
			}

			$.template_effect(() => $.set_text(text_2, $.get(active_page).name));
			$.append($$anchor, fragment_17);
		};

		$.if(node_22, ($$render) => {
			if ($.get(active_page_type)) $$render(consequent_3); else if ($.get(active_page)) $$render(consequent_6, 1);
		});
	}

	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var div_12 = $.child(div_11);

	$.each(div_12, 21, () => $.get(user_activities), $.index, ($$anchor, activities) => {
		const computed_const = $.derived(() => {
			return $.get(activities)[0];
		});

		var div_13 = root_14();
		var node_28 = $.child(div_13);

		$.component(node_28, () => Popover.Root, ($$anchor, Popover_Root) => {
			Popover_Root($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_19 = root_3();
					var node_29 = $.first_child(fragment_19);

					$.component(node_29, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_20 = $.comment();
								var node_30 = $.first_child(fragment_20);

								$.component(node_30, () => Avatar.Root, ($$anchor, Avatar_Root) => {
									Avatar_Root($$anchor, {
										class: 'ring-background transition-all ring-2 size-[27px]',
										children: ($$anchor, $$slotProps) => {
											var fragment_21 = root_3();
											var node_31 = $.first_child(fragment_21);

											{
												var consequent_7 = ($$anchor) => {
													var fragment_22 = $.comment();
													var node_32 = $.first_child(fragment_22);

													{
														let $0 = $.derived(() => $.get(computed_const).user.name || $.get(computed_const).user.email);

														$.component(node_32, () => Avatar.Image, ($$anchor, Avatar_Image) => {
															Avatar_Image($$anchor, {
																get src() {
																	return $.get(computed_const).user_avatar;
																},

																get alt() {
																	return $.get($0);
																},
																class: 'grayscale hover:grayscale-0 object-cover object-center'
															});
														});
													}

													$.append($$anchor, fragment_22);
												};

												$.if(node_31, ($$render) => {
													if ($.get(computed_const).user_avatar) $$render(consequent_7);
												});
											}

											var node_33 = $.sibling(node_31, 2);

											$.component(node_33, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
												Avatar_Fallback($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text();

														$.template_effect(($0) => $.set_text(text_3, $0), [
															() => ($.get(computed_const).user.name || $.get(computed_const).user.email).slice(0, 2).toUpperCase()
														]);

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

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

					var node_34 = $.sibling(node_29, 2);

					$.component(node_34, () => Popover.Content, ($$anchor, Popover_Content) => {
						Popover_Content($$anchor, {
							class: 'w-auto z-[99]',
							children: ($$anchor, $$slotProps) => {
								var div_14 = root_13();
								var node_35 = $.child(div_14);

								$.component(node_35, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
									Avatar_Root_1($$anchor, {
										class: 'data-[status=loaded]:border-foreground bg-muted text-muted-foreground h-12 w-12 rounded-full border border-transparent text-[17px] font-medium uppercase',
										children: ($$anchor, $$slotProps) => {
											var div_15 = root_9();
											var node_36 = $.child(div_15);

											{
												var consequent_8 = ($$anchor) => {
													var fragment_24 = $.comment();
													var node_37 = $.first_child(fragment_24);

													{
														let $0 = $.derived(() => $.get(computed_const).user.name || $.get(computed_const).user.email);

														$.component(node_37, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
															Avatar_Image_1($$anchor, {
																get src() {
																	return $.get(computed_const).user_avatar;
																},

																get alt() {
																	return $.get($0);
																},
																class: 'object-cover object-center'
															});
														});
													}

													$.append($$anchor, fragment_24);
												};

												$.if(node_36, ($$render) => {
													if ($.get(computed_const).user_avatar) $$render(consequent_8);
												});
											}

											var node_38 = $.sibling(node_36, 2);

											$.component(node_38, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
												Avatar_Fallback_1($$anchor, {
													class: 'border-muted border',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text();

														$.template_effect(($0) => $.set_text(text_4, $0), [
															() => ($.get(computed_const).user.name || $.get(computed_const).user.email).slice(0, 2).toUpperCase()
														]);

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_15);
											$.append($$anchor, div_15);
										},
										$$slots: { default: true }
									});
								});

								var div_16 = $.sibling(node_35, 2);
								var h4 = $.child(div_16);
								var text_5 = $.only_child(h4, true);
								var node_39 = $.sibling(h4, 2);

								$.each(node_39, 17, () => $.get(activities), $.index, ($$anchor, $$item, $$index, $$array) => {
									let page = () => $.get($$item).page;
									let page_type_url = () => $.get($$item).page_type_url;
									let page_url = () => $.get($$item).page_url;
									let page_type = () => $.get($$item).page_type;
									let page_page_type = () => $.get($$item).page_page_type;
									let site_symbol = () => $.get($$item).site_symbol;
									var div_17 = root_12();
									var node_40 = $.child(div_17);

									{
										var consequent_9 = ($$anchor) => {
											var fragment_26 = root_10();
											var node_41 = $.first_child(fragment_26);

											Icon(node_41, { icon: 'lucide:cuboid' });

											var p_1 = $.sibling(node_41, 2);
											var text_6 = $.only_child(p_1, true);

											$.template_effect(() => $.set_text(text_6, site_symbol().name));
											$.append($$anchor, fragment_26);
										};

										var consequent_10 = ($$anchor) => {
											var fragment_27 = root_11();
											var node_42 = $.first_child(fragment_27);

											Icon(node_42, {
												get icon() {
													return page_page_type().icon;
												}
											});

											var a_2 = $.sibling(node_42, 2);
											var text_7 = $.only_child(a_2, true);

											$.template_effect(() => {
												$.set_attribute(a_2, 'href', page_url()?.href);
												$.set_text(text_7, page().name);
											});

											$.append($$anchor, fragment_27);
										};

										var consequent_11 = ($$anchor) => {
											var fragment_28 = root_11();
											var node_43 = $.first_child(fragment_28);

											Icon(node_43, {
												get icon() {
													return page_type().icon;
												}
											});

											var a_3 = $.sibling(node_43, 2);
											var text_8 = $.only_child(a_3, true);

											$.template_effect(() => {
												$.set_attribute(a_3, 'href', page_type_url()?.href);
												$.set_text(text_8, page_type().name);
											});

											$.append($$anchor, fragment_28);
										};

										$.if(node_40, ($$render) => {
											if (site_symbol()) $$render(consequent_9); else if (page() && page_page_type()) $$render(consequent_10, 1); else if (page_type()) $$render(consequent_11, 2);
										});
									}

									$.reset(div_17);
									$.append($$anchor, div_17);
								});

								$.reset(div_16);
								$.reset(div_14);
								$.template_effect(() => $.set_text(text_5, $.get(computed_const).user.name || $.get(computed_const).user.email));
								$.append($$anchor, div_14);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_19);
				},
				$$slots: { default: true }
			});
		});

		$.reset(div_13);
		$.transition(3, div_13, () => fade);
		$.append($$anchor, div_13);
	});

	$.reset(div_12);

	var node_44 = $.sibling(div_12, 4);

	$.component(node_44, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
		DropdownMenu_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_29 = root_3();
				var node_45 = $.first_child(fragment_29);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var button_1 = root_15();

						$.attribute_effect(button_1, () => ({ ...props(), class: 'more-menu-button' }), void 0, void 0, void 0, 'svelte-1105vux');

						var node_46 = $.child(button_1);

						Icon(node_46, { icon: 'mdi:dots-vertical' });
						$.reset(button_1);
						$.append($$anchor, button_1);
					};

					$.component(node_45, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
						DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_47 = $.sibling(node_45, 2);

				$.component(node_47, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
					DropdownMenu_Content_1($$anchor, {
						side: 'bottom',
						class: 'z-[999]',
						align: 'end',
						sideOffset: 4,
						children: ($$anchor, $$slotProps) => {
							var fragment_30 = root_3();
							var node_48 = $.first_child(fragment_30);

							{
								var consequent_12 = ($$anchor) => {
									var fragment_31 = $.comment();
									var node_49 = $.first_child(fragment_31);

									$.component(node_49, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
										DropdownMenu_Item_1($$anchor, {
											onclick: () => $.set(editing_collaborators, true),
											class: 'text-xs cursor-pointer',
											children: ($$anchor, $$slotProps) => {
												var fragment_32 = root_16();
												var node_50 = $.first_child(fragment_32);

												Icon(node_50, { icon: 'clarity:users-solid', style: 'width: .75rem' });
												$.next(2);
												$.append($$anchor, fragment_32);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_31);
								};

								$.if(node_48, ($$render) => {
									if (!instance.dev_mode && $current_user()?.serverRole) $$render(consequent_12);
								});
							}

							var node_51 = $.sibling(node_48, 2);

							$.component(node_51, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
								DropdownMenu_Item_2($$anchor, {
									onclick: async () => {
										self.instance?.authStore.clear();
										await goto('/admin/auth');
									},
									class: 'text-xs cursor-pointer',
									children: ($$anchor, $$slotProps) => {
										var fragment_33 = root_17();
										var node_52 = $.first_child(fragment_33);

										Icon(node_52, { icon: 'mdi:logout', style: 'width: .75rem' });
										$.next(2);
										$.append($$anchor, fragment_33);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_30);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_29);
			},
			$$slots: { default: true }
		});
	});

	var node_53 = $.sibling(node_44, 2);

	$.snippet(node_53, () => $$props.children ?? $.noop);

	var node_54 = $.sibling(node_53, 2);

	{
		let $0 = $.derived(() => instance.dev_mode ? 'lucide:eye' : 'entypo:publish');
		let $1 = $.derived(() => instance.dev_mode ? 'Preview' : 'Publish');

		ToolbarButton(node_54, {
			type: 'primo',
			get icon() {
				return $.get($0);
			},

			get label() {
				return $.get($1);
			},
			key: 'p',
			get loading() {
				return $.get(publish_in_progress);
			},
			$$events: { click: () => $.set(publishing, true) }
		});
	}

	$.reset(div_11);
	$.reset(div);
	$.reset(nav);
	$.template_effect(() => $.set_text(text, site?.name));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}