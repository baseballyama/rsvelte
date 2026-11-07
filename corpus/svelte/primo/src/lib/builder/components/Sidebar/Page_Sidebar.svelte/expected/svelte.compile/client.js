import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as _ from 'lodash-es';
import { Skeleton } from '$lib/components/ui/skeleton';
import { dragging_symbol } from '$lib/builder/stores/app/misc';
import Sidebar_Symbol from './Sidebar_Symbol.svelte';
import Content from '../Content.svelte';
import { Button } from '$lib/components/ui/button';
import { goto } from '$app/navigation';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { site_html } from '$lib/builder/stores/app/page';
import * as Tabs from '$lib/components/ui/tabs';
import { Cuboid, SquarePen, ExternalLink } from 'lucide-svelte';
import { page as pageState } from '$app/state';
import { PageTypes, Sites, Pages, PageEntries } from '$lib/pocketbase/collections';
import { SiteSymbols } from '$lib/pocketbase/collections';
import { site_context } from '$lib/builder/stores/context';
import { setFieldEntries } from '../Fields/FieldsContent.svelte';
import { current_user } from '$lib/pocketbase/user';
import { author_mode } from '$lib/pocketbase/author_mode';
import { resolve_page } from '$lib/pages';
import { self } from '$lib/pocketbase/managers';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div class="skeleton-item mb-4"><div class="flex items-center justify-between pb-2"><!></div> <!></div>`);
var root_2 = $.from_html(`<div class="block-skeletons pt-2"></div>`);
var root_3 = $.from_html(`Manage Blocks <!>`, 1);
var root_4 = $.from_html(`<div class="symbols svelte-1871myv"><!></div> <!>`, 1);
var root_5 = $.from_html(`Manage Fields <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<!> <span class="text-xs">Blocks</span>`, 1);
var root_8 = $.from_html(`<!> <span class="text-xs">Fields</span>`, 1);
var root_9 = $.from_html(`<!> <!> <!>`, 1);
var root_10 = $.from_html(`<div class="sidebar primo-reset svelte-1871myv"><!></div>`);

export default function Page_Sidebar($$anchor, $$props) {
	$.push($$props, true);

	const $dragging_symbol = () => $.store_get(dragging_symbol, '$dragging_symbol', $$stores);
	const $site_html = () => $.store_get(site_html, '$site_html', $$stores);
	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $author_mode = () => $.store_get(author_mode, '$author_mode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const // TODO: Implement
	// TODO: Implement
	symbols = ($$anchor) => {
		var fragment = root_4();
		var div = $.first_child(fragment);
		var node = $.child(div);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 19, () => $.get(available_symbols) ?? [], (symbol) => symbol.id, ($$anchor, symbol) => {
					var div_1 = root();
					var node_2 = $.child(div_1);

					{
						let $0 = $.derived(() => $.get(page_type)?.id);

						Sidebar_Symbol(node_2, {
							get symbol() {
								return $.get(symbol);
							},
							controls_enabled: false,
							get head() {
								return $site_html();
							},

							get active_page_type_id() {
								return $.get($0);
							},
							toggled: true
						});
					}

					$.reset(div_1);
					$.action(div_1, ($$node, $$action_arg) => drag_target?.($$node, $$action_arg), () => $.get(symbol));
					$.append($$anchor, div_1);
				});

				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var div_2 = root_2();

				$.each(div_2, 20, () => Array(4), $.index, ($$anchor, _, i, $$array) => {
					var div_3 = root_1();
					var div_4 = $.child(div_3);
					var node_3 = $.child(div_4);

					Skeleton(node_3, { class: 'h-4 w-28' });
					$.reset(div_4);

					var node_4 = $.sibling(div_4, 2);

					Skeleton(node_4, { class: 'h-24 w-full rounded-md' });
					$.reset(div_3);
					$.append($$anchor, div_3);
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			};

			$.if(node, ($$render) => {
				if ($site_html() !== null) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div);

		var node_5 = $.sibling(div, 2);

		{
			var consequent_1 = ($$anchor) => {
				Button($$anchor, {
					class: 'mt-4',
					size: 'sm',
					variant: 'outline',
					onclick: () => {
						const base_path = pageState.url.pathname.includes('/sites/') ? `/admin/sites/${site?.id}` : '/admin/site';

						goto(`${base_path}/page-type--${$.get(page_type)?.id}?tab=blocks`);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_3 = root_3();
						var node_6 = $.sibling($.first_child(fragment_3));

						ExternalLink(node_6, { class: 'w-3' });
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			};

			$.if(node_5, ($$render) => {
				if ($current_user()?.siteRole === 'developer') $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment);
	};

	const content = ($$anchor) => {
		var fragment_4 = root_6();
		var node_7 = $.first_child(fragment_4);

		{
			var consequent_2 = ($$anchor) => {
				var div_5 = root();
				let classes;
				var node_8 = $.child(div_5);

				Content(node_8, {
					get entity() {
						return $.get(page);
					},

					get fields() {
						return $.get(page_type_fields);
					},

					get entries() {
						return $.get(page_entries);
					},

					oninput: (values) => {
						if ($author_mode() === 'files') return;

						setFieldEntries({
							fields: $.get(page_type_fields),
							entries: $.get(page_entries),
							updateEntry: PageEntries.update,
							createEntry: (data) => PageEntries.create({ ...data, page: $.get(page).id }),
							values
						});

						clearTimeout(commit_task);
						commit_task = setTimeout(() => self.commit(), 500);
					},

					ondelete: (entry_id) => {
						if ($author_mode() === 'files') return;

						PageEntries.delete(entry_id);
						clearTimeout(commit_task);
						commit_task = setTimeout(() => self.commit(), 500);
					}
				});

				$.reset(div_5);
				$.template_effect(() => classes = $.set_class(div_5, 1, 'page-type-fields svelte-1871myv', null, classes, { 'p-2': !$.get(has_symbols) }));
				$.append($$anchor, div_5);
			};

			$.if(node_7, ($$render) => {
				if ($.get(page) && $.get(page_type_fields) && $.get(page_entries)) $$render(consequent_2);
			});
		}

		var node_9 = $.sibling(node_7, 2);

		{
			var consequent_3 = ($$anchor) => {
				Button($$anchor, {
					class: 'py-3 mt-2',
					size: 'sm',
					variant: 'outline',
					onclick: () => {
						const base_path = pageState.url.pathname.startsWith('/admin/sites/') ? `/admin/sites/${site?.id}` : '/admin/site';

						goto(`${base_path}/page-type--${$.get(page_type)?.id}?tab=fields`);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_6 = root_5();
						var node_10 = $.sibling($.first_child(fragment_6));

						ExternalLink(node_10, { class: 'w-3' });
						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			};

			$.if(node_9, ($$render) => {
				if ($current_user()?.siteRole === 'developer') $$render(consequent_3);
			});
		}

		$.append($$anchor, fragment_4);
	};

	const { value: site } = site_context.getOr({ value: null });
	const path = $.derived(() => pageState.params.page?.split('/'));
	const page = $.derived(() => site && ($.get(path) ? resolve_page(site, $.get(path)) : site.homepage()));
	const page_type = $.derived(() => $.get(page) && PageTypes.one($.get(page).page_type));
	const page_type_fields = $.derived(() => $.get(page_type)?.fields());
	const page_entries = $.derived(() => $.get(page)?.entries());
	const page_type_symbols = $.derived(() => $.get(page_type)?.symbols() ?? []);
	const available_symbols = $.derived(() => $.get(page_type_symbols).map(({ symbol }) => SiteSymbols.one(symbol)).filter((symbol) => !!symbol));
	const has_symbols = $.derived(() => $.get(available_symbols)?.length !== 0);

	function drag_target(element, block) {
		dropTargetForElements({
			element,
			getData({ input, element }) {
				return attachClosestEdge({ block }, { element, input, allowedEdges: ['top', 'bottom'] });
			},

			onDragStart() {
				$.store_set(dragging_symbol, true);
			},

			onDragEnd() {
				$.store_set(dragging_symbol, false);
			},

			onDrop({ self, source }) {
				$.store_set(dragging_symbol, false);

				const closestEdgeOfTarget = extractClosestEdge(self.data);

				if (closestEdgeOfTarget === 'top') {
					// TODO: Implement
					throw new Error('Not implemented');
				} else if (closestEdgeOfTarget === 'bottom') {
					// TODO: Implement
					throw new Error('Not implemented');
				}
			}
		});
	}

	let commit_task;
	var div_6 = root_10();
	var node_11 = $.child(div_6);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_12 = $.first_child(fragment_7);

			$.component(node_12, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					value: 'blocks',
					class: 'p-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_9();
						var node_13 = $.first_child(fragment_8);

						$.component(node_13, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								class: 'w-full mb-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_6();
									var node_14 = $.first_child(fragment_9);

									$.component(node_14, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
										Tabs_Trigger($$anchor, {
											value: 'blocks',
											class: 'flex-1 flex gap-1',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_7();
												var node_15 = $.first_child(fragment_10);

												Cuboid(node_15, { class: 'w-3' });
												$.next(2);
												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_14, 2);

									$.component(node_16, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
										Tabs_Trigger_1($$anchor, {
											value: 'content',
											class: 'flex-1 flex gap-1',
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root_8();
												var node_17 = $.first_child(fragment_11);

												SquarePen(node_17, { class: 'w-3' });
												$.next(2);
												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_18 = $.sibling(node_13, 2);

						$.component(node_18, () => Tabs.Content, ($$anchor, Tabs_Content) => {
							Tabs_Content($$anchor, {
								value: 'blocks',
								children: ($$anchor, $$slotProps) => {
									symbols($$anchor);
								},
								$$slots: { default: true }
							});
						});

						var node_19 = $.sibling(node_18, 2);

						$.component(node_19, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
							Tabs_Content_1($$anchor, {
								value: 'content',
								children: ($$anchor, $$slotProps) => {
									content($$anchor);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_7);
		};

		var alternate_1 = ($$anchor) => {
			content($$anchor);
		};

		$.if(node_11, ($$render) => {
			if ($.get(has_symbols)) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_6);
	$.append($$anchor, div_6);
	$.pop();
	$$cleanup();
}