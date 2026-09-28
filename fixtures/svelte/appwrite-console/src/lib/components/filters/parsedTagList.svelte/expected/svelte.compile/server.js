import * as $ from 'svelte/internal/server';

import {
	Icon,
	Layout,
	Tooltip,
	CompoundTagRoot,
	CompoundTagChild,
	Typography,
	ActionMenu,
	Selector
} from '@appwrite.io/pink-svelte';

import { capitalize } from '$lib/helpers/string';
import { queries, tags } from './store';
import { IconX } from '@appwrite.io/pink-icons-svelte';
import { parsedTags } from './setFilters';
import { Button } from '$lib/elements/forms';
import { writable } from 'svelte/store';
import Menu from '$lib/components/menu/menu.svelte';
import { addFilterAndApply, buildFilterCol } from './quickFilters';
import QuickFilters from '$lib/components/filters/quickFilters.svelte';
import { isSmallViewport } from '$lib/stores/viewport';

export default function ParsedTagList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { columns = writable([]), analyticsSource = '' } = $$props;

		function parseTagParts(tagString) {
			return tagString.split(/\*\*(.*?)\*\*/).map((part, index) => {
				// Even indices are outside bold (operators), odd indices are inside bold (values)
				if (index % 2 === 0) {
					return part.split(/\s+/).filter(Boolean).map((t) => ({ text: t, operator: true }));
				} else {
					return [{ text: part, operator: false }];
				}
			}).flat().filter((p) => Boolean(p.text));
		}

		function getFilterFor(title) {
			if (!columns) return null;

			const col = $.store_get($$store_subs ??= {}, '$columns', columns).find((c) => c.title === title);

			if (!col) return null;

			const filter = buildFilterCol(col);

			return filter ?? null;
		}

		// Build available filter definitions from provided columns
		let availableFilters = $.derived(() => $.store_get($$store_subs ??= {}, '$columns', columns)?.length
			? $.store_get($$store_subs ??= {}, '$columns', columns).map((c) => c.filter !== false ? buildFilterCol(c) : null).filter((f) => f && f.options)
			: []);

		// QuickFilters uses the same filters list
		let filterCols = $.derived(availableFilters);

		// Always-show placeholders are derived from available filters (no hardcoding)
		// Use reactive array so runes can track changes
		let hiddenPlaceholders = [];

		let activeTitles = $.derived(() => ($.store_get($$store_subs ??= {}, '$parsedTags', parsedTags) || []).map((t) => t.title).filter(Boolean));

		// Compute current placeholders (major filters not already active or dismissed)
		let placeholders = $.derived(() => availableFilters().filter((f) => !activeTitles().includes(f.title)).filter((f) => !hiddenPlaceholders.includes(f.title)));

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				direction: 'row',
				gap: 's',
				wrap: 'wrap',
				alignItems: 'center',
				inline: true,
				children: ($$renderer) => {
					if ($.store_get($$store_subs ??= {}, '$parsedTags', parsedTags)?.length) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$parsedTags', parsedTags));

						for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
							let tag = each_array[$$index_2];

							$$renderer.push(`<span>`);

							Tooltip($$renderer, {
								disabled: Array.isArray(tag.value) ? tag.value?.length < 3 : true,
								maxWidth: '600px',
								children: ($$renderer) => {
									CompoundTagRoot($$renderer, {
										size: 's',
										children: ($$renderer) => {
											const parts = parseTagParts(tag.tag);
											const property = tag.title;

											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like(parts);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let part = each_array_1[$$index_1];

												CompoundTagChild($$renderer, {
													children: ($$renderer) => {
														Menu($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<span>`);

																if (part.operator) {
																	$$renderer.push('<!--[0-->');

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			color: '--fgcolor-neutral-secondary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(part.text)}`);
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

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			variant: 'm-500',
																			color: '--fgcolor-neutral-secondary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(part.text.split(' or ').map((t) => capitalize(t)).join(' or '))}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}

																$$renderer.push(`<!--]--></span>`);
															},

															$$slots: {
																default: true,
																menu: ($$renderer) => {
																	{
																		if (property) {
																			$$renderer.push('<!--[0-->');

																			const filter = getFilterFor(property);

																			if (filter) {
																				$$renderer.push('<!--[0-->');

																				const isArray = filter?.array;
																				const selectedArray = Array.isArray(tag.value) ? tag.value : [];

																				$$renderer.push(`<!--[-->`);

																				const each_array_2 = $.ensure_array_like(filter.options);

																				for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
																					let option = each_array_2[$$index];

																					if (ActionMenu.Root) {
																						$$renderer.push('<!--[-->');

																						ActionMenu.Root($$renderer, {
																							children: ($$renderer) => {
																								if (ActionMenu.Item.Button) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Item.Button($$renderer, {
																										children: ($$renderer) => {
																											if (Layout.Stack) {
																												$$renderer.push('<!--[-->');

																												Layout.Stack($$renderer, {
																													direction: 'row',
																													gap: 's',
																													children: ($$renderer) => {
																														if (isArray) {
																															$$renderer.push('<!--[0-->');

																															if (Selector.Checkbox) {
																																$$renderer.push('<!--[-->');
																																Selector.Checkbox($$renderer, { checked: selectedArray.includes(option.value), size: 's' });
																																$$renderer.push('<!--]-->');
																															} else {
																																$$renderer.push('<!--[!-->');
																																$$renderer.push('<!--]-->');
																															}
																														} else {
																															$$renderer.push('<!--[-1-->');
																														}

																														$$renderer.push(`<!--]--> ${$.escape(capitalize(option.label))}`);
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

																				$$renderer.push(`<!--]-->`);
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]-->`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]-->`);
																	}
																}
															}
														});
													},
													$$slots: { default: true }
												});
											}

											$$renderer.push(`<!--]--> `);

											CompoundTagChild($$renderer, {
												dismiss: true,
												children: ($$renderer) => {
													Icon($$renderer, { icon: IconX, size: 's' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								},

								$$slots: {
									default: true,
									tooltip: ($$renderer) => {
										$$renderer.push(`<span slot="tooltip">${$.escape(tag?.value?.toString())}</span>`);
									}
								}
							});

							$$renderer.push(`<!----></span>`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (placeholders()?.length) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array_3 = $.ensure_array_like(placeholders());

						for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
							let filter = each_array_3[$$index_4];

							$$renderer.push(`<span>`);

							Menu($$renderer, {
								children: ($$renderer) => {
									CompoundTagRoot($$renderer, {
										size: 's',
										children: ($$renderer) => {
											CompoundTagChild($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<span>${$.escape(capitalize(filter.title))}</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											CompoundTagChild($$renderer, {
												dismiss: true,
												children: ($$renderer) => {
													Icon($$renderer, { icon: IconX, size: 's' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								},

								$$slots: {
									default: true,
									menu: ($$renderer) => {
										{
											if (filter.options) {
												$$renderer.push(`<!--[0--><!--[-->`);

												const each_array_4 = $.ensure_array_like(filter.options);

												for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
													let option = each_array_4[$$index_3];

													if (ActionMenu.Root) {
														$$renderer.push('<!--[-->');

														ActionMenu.Root($$renderer, {
															children: ($$renderer) => {
																if (ActionMenu.Item.Button) {
																	$$renderer.push('<!--[-->');

																	ActionMenu.Item.Button($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(capitalize(option.label))}`);
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
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}
									}
								}
							});

							$$renderer.push(`<!----></span>`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if ($.store_get($$store_subs ??= {}, '$parsedTags', parsedTags)?.length) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							size: 's',
							text: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Clear all`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (filterCols()?.length && !$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
						$$renderer.push('<!--[0-->');
						QuickFilters($$renderer, { columns, analyticsSource, filterCols: filterCols() });
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}