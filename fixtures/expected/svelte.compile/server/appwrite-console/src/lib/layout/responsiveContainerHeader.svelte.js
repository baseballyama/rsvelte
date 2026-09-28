import * as $ from 'svelte/internal/server';
import { SearchQuery, ViewSelector } from '$lib/components';
import { FiltersBottomSheet, ParsedTagList, queryParamToMap } from '$lib/components/filters';
import QuickFilters from '$lib/components/filters/quickFilters.svelte';
import Button from '$lib/elements/forms/button.svelte';
import { View } from '$lib/helpers/load';
import { isSmallViewport } from '$lib/stores/viewport';
import { IconAdjustments, IconFilterLine, IconSearch } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import DisplaySettingsModal from './displaySettingsModal.svelte';
import { buildFilterCol } from '$lib/components/filters/quickFilters';
import { afterNavigate } from '$app/navigation';
import { parsedTags, setFilters } from '$lib/components/filters/setFilters';

export default function ResponsiveContainerHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			columns,
			view = View.Table,
			hideView = false,
			hideColumns = false,
			hasSearch = false,
			searchPlaceholder = 'Search by ID',
			hasFilters = false,
			filtersStyle = 'chips',
			analyticsSource = '',
			children
		} = $$props;

		let hasDisplaySettings = $.derived(() => !hideView || !hideColumns && $.store_get($$store_subs ??= {}, '$columns', columns)?.length);

		let numberOfOptions = $.derived(() => [
			hasSearch,
			hasFilters && $.store_get($$store_subs ??= {}, '$columns', columns)?.length,
			hasDisplaySettings()
		].filter(Boolean).length);

		let showSearch = false;
		let showDisplaySettingsModal = false;
		let showFilters = false;
		const filterCols = $.derived(() => $.store_get($$store_subs ??= {}, '$columns', columns).map((col) => col.filter !== false ? buildFilterCol(col) : null).filter(Boolean));

		const filtersBadge = $.derived(() => filtersStyle === 'dropdown' && $.store_get($$store_subs ??= {}, '$parsedTags', parsedTags)?.length
			? `${$.store_get($$store_subs ??= {}, '$parsedTags', parsedTags).length}`
			: undefined);

		afterNavigate((p) => {
			if (!hasFilters) return;

			const paramQueries = p.to.url.searchParams.get('query');
			const localQueries = queryParamToMap(paramQueries || '[]');
			const localTags = Array.from(localQueries.keys());

			setFilters(localTags, filterCols(), $.store_get($$store_subs ??= {}, '$columns', columns));
		});

		function searchButton($$renderer, icon = false) {
			Button($$renderer, {
				ariaLabel: 'Search',
				secondary: true,
				icon,
				children: ($$renderer) => {
					Icon($$renderer, { icon: IconSearch });
				},
				$$slots: { default: true }
			});
		}

		function settingsButton($$renderer, icon = false) {
			Button($$renderer, {
				ariaLabel: 'Display settings',
				secondary: true,
				icon,
				children: ($$renderer) => {
					Icon($$renderer, { icon: IconAdjustments });
				},
				$$slots: { default: true }
			});
		}

		function filtersButton($$renderer, icon = false) {
			Button($$renderer, {
				ariaLabel: 'Filters',
				text: true,
				icon,
				badge: filtersBadge(),
				children: ($$renderer) => {
					Icon($$renderer, { icon: IconFilterLine });
				},
				$$slots: { default: true }
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<header>`);

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					children: ($$renderer) => {
						if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xl',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												children: ($$renderer) => {
													if (children) {
														$$renderer.push(`<!--[0--><div${$.attr_style(`--button-width: 100%; width: 100%`)}>`);
														children($$renderer);
														$$renderer.push(`<!----></div>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (numberOfOptions() === 1) {
														$$renderer.push('<!--[0-->');

														if (hasSearch) {
															$$renderer.push('<!--[0-->');
															searchButton($$renderer, true);
														} else if (hasFilters && $.store_get($$store_subs ??= {}, '$columns', columns)?.length) {
															$$renderer.push('<!--[1-->');
															filtersButton($$renderer, true);
														} else if (hasDisplaySettings()) {
															$$renderer.push('<!--[2-->');
															settingsButton($$renderer, true);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
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

										$$renderer.push(` `);

										if (numberOfOptions() > 1) {
											$$renderer.push('<!--[0-->');

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'row',
													gap: 's',
													style: `--button-width: calc(${100 / numberOfOptions()}% - var(--gap-s) / 2)`,
													children: ($$renderer) => {
														if (hasSearch) {
															$$renderer.push('<!--[0-->');
															searchButton($$renderer);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> `);

														if (hasFilters && $.store_get($$store_subs ??= {}, '$columns', columns)?.length) {
															$$renderer.push('<!--[0-->');
															filtersButton($$renderer);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> `);

														if (hasDisplaySettings()) {
															$$renderer.push('<!--[0-->');
															settingsButton($$renderer);
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
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (showSearch && hasSearch) {
											$$renderer.push('<!--[0-->');
											SearchQuery($$renderer, { placeholder: searchPlaceholder });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (hasFilters && filtersStyle === 'chips') {
											$$renderer.push(`<!--[0--><div style="overflow-x: auto;">`);
											ParsedTagList($$renderer, { columns, analyticsSource });
											$$renderer.push(`<!----></div>`);
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
						} else {
							$$renderer.push('<!--[-1-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									justifyContent: 'space-between',
									alignItems: 'flex-start',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												alignItems: 'flex-start',
												gap: 'm',
												style: 'min-width: 0; flex: 1 1 auto;',
												children: ($$renderer) => {
													if (hasSearch) {
														$$renderer.push(`<!--[0--><div style="flex: 0 0 auto; max-width: 360px; min-width: 0;">`);
														SearchQuery($$renderer, { placeholder: searchPlaceholder });
														$$renderer.push(`<!----></div>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (hasFilters && filtersStyle === 'chips') {
														$$renderer.push('<!--[0-->');

														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'row',
																alignItems: 'center',
																gap: 's',
																wrap: 'wrap',
																style: 'min-width: 0; flex: 1 1 auto;',
																children: ($$renderer) => {
																	ParsedTagList($$renderer, { columns, analyticsSource });
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

										$$renderer.push(` `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												alignItems: 'center',
												justifyContent: 'flex-end',
												style: 'align-self: flex-start; white-space: nowrap;',
												children: ($$renderer) => {
													if (hasFilters && filtersStyle === 'dropdown') {
														$$renderer.push('<!--[0-->');

														QuickFilters($$renderer, {
															columns,
															analyticsSource,
															buttonVariant: 'secondary',
															filterCols: filterCols().filter((f) => f?.options)
														});
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (hasDisplaySettings()) {
														$$renderer.push('<!--[0-->');
														ViewSelector($$renderer, { ui: 'new', view, columns, hideView, hideColumns });
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (children) {
														$$renderer.push('<!--[0-->');
														children($$renderer);
														$$renderer.push(`<!---->`);
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

			$$renderer.push(`</header> `);

			if (showDisplaySettingsModal) {
				$$renderer.push('<!--[0-->');

				DisplaySettingsModal($$renderer, {
					columns,
					hideColumns,
					hideView,
					get show() {
						return showDisplaySettingsModal;
					},

					set show($$value) {
						showDisplaySettingsModal = $$value;
						$$settled = false;
					},

					get view() {
						return view;
					},

					set view($$value) {
						view = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) && showFilters) {
				$$renderer.push('<!--[0-->');

				FiltersBottomSheet($$renderer, {
					columns,
					analyticsSource,
					filterCols: filterCols().filter((f) => f?.options),
					get openBottomSheet() {
						return showFilters;
					},

					set openBottomSheet($$value) {
						showFilters = $$value;
						$$settled = false;
					}
				});
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { view });
	});
}