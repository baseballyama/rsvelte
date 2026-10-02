import * as $ from 'svelte/internal/server';
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

export default function Page_Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { value: site } = site_context.getOr({ value: null });
		const path = $.derived(() => pageState.params.page?.split('/'));
		const page = $.derived(() => site && (path() ? resolve_page(site, path()) : site.homepage()));
		const page_type = $.derived(() => page() && PageTypes.one(page().page_type));
		const page_type_fields = $.derived(() => page_type()?.fields());
		const page_entries = $.derived(() => page()?.entries());
		const page_type_symbols = $.derived(() => page_type()?.symbols() ?? []);
		const available_symbols = $.derived(() => page_type_symbols().map(({ symbol }) => SiteSymbols.one(symbol)).filter((symbol) => !!symbol));
		const has_symbols = $.derived(() => available_symbols()?.length !== 0);

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

		function symbols($$renderer) {
			$$renderer.push(`<div class="symbols svelte-1871myv">`);

			if ($.store_get($$store_subs ??= {}, '$site_html', site_html) !== null) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(available_symbols() ?? []);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let symbol = each_array[i];

					$$renderer.push(`<div>`);

					Sidebar_Symbol($$renderer, {
						symbol,
						controls_enabled: false,
						head: $.store_get($$store_subs ??= {}, '$site_html', site_html),
						active_page_type_id: page_type()?.id,
						toggled: true
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1--><div class="block-skeletons pt-2"><!--[-->`);

				const each_array_1 = $.ensure_array_like(Array(4));

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let _ = each_array_1[i];

					$$renderer.push(`<div class="skeleton-item mb-4"><div class="flex items-center justify-between pb-2">`);
					Skeleton($$renderer, { class: 'h-4 w-28' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'h-24 w-full rounded-md' });
					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					class: 'mt-4',
					size: 'sm',
					variant: 'outline',
					onclick: () => {
						const base_path = pageState.url.pathname.includes('/sites/') ? `/admin/sites/${site?.id}` : '/admin/site';

						goto(`${base_path}/page-type--${page_type()?.id}?tab=blocks`);
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Manage Blocks `);
						ExternalLink($$renderer, { class: 'w-3' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function content($$renderer) {
			if (page() && page_type_fields() && page_entries()) {
				$$renderer.push(`<!--[0--><div${$.attr_class('page-type-fields svelte-1871myv', void 0, { 'p-2': !has_symbols() })}>`);

				Content($$renderer, {
					entity: page(),
					fields: page_type_fields(),
					entries: page_entries(),
					oninput: (values) => {
						if ($.store_get($$store_subs ??= {}, '$author_mode', author_mode) === 'files') return;

						setFieldEntries({
							fields: page_type_fields(),
							entries: page_entries(),
							updateEntry: PageEntries.update,
							createEntry: (data) => PageEntries.create({ ...data, page: page().id }),
							values
						});

						clearTimeout(commit_task);
						commit_task = setTimeout(() => self.commit(), 500);
					},

					ondelete: (entry_id) => {
						if ($.store_get($$store_subs ??= {}, '$author_mode', author_mode) === 'files') return;

						PageEntries.delete(entry_id);
						clearTimeout(commit_task);
						commit_task = setTimeout(() => self.commit(), 500);
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					class: 'py-3 mt-2',
					size: 'sm',
					variant: 'outline',
					onclick: () => {
						const base_path = pageState.url.pathname.startsWith('/admin/sites/') ? `/admin/sites/${site?.id}` : '/admin/site';

						goto(`${base_path}/page-type--${page_type()?.id}?tab=fields`);
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Manage Fields `);
						ExternalLink($$renderer, { class: 'w-3' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<div class="sidebar primo-reset svelte-1871myv">`);

		if (has_symbols()) {
			$$renderer.push('<!--[0-->');

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					value: 'blocks',
					class: 'p-2',
					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'w-full mb-2',
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'blocks',
											class: 'flex-1 flex gap-1',
											children: ($$renderer) => {
												Cuboid($$renderer, { class: 'w-3' });
												$$renderer.push(`<!----> <span class="text-xs">Blocks</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'content',
											class: 'flex-1 flex gap-1',
											children: ($$renderer) => {
												SquarePen($$renderer, { class: 'w-3' });
												$$renderer.push(`<!----> <span class="text-xs">Fields</span>`);
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

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'blocks',
								children: ($$renderer) => {
									symbols($$renderer);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'content',
								children: ($$renderer) => {
									content($$renderer);
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
			content($$renderer);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}