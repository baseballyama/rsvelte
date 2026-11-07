import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<span slot="tooltip"> </span>`);
var root_4 = $.from_html(`<span> </span>`);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function ParsedTagList($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns(), '$columns', $$stores);
	const $parsedTags = () => $.store_get(parsedTags, '$parsedTags', $$stores);
	const $tags = () => $.store_get(tags, '$tags', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let columns = $.prop($$props, 'columns', 19, () => writable([])),
		analyticsSource = $.prop($$props, 'analyticsSource', 3, '');

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
		if (!columns()) return null;

		const col = $columns().find((c) => c.title === title);

		if (!col) return null;

		const filter = buildFilterCol(col);

		return filter ?? null;
	}

	// Build available filter definitions from provided columns
	let availableFilters = $.derived(() => $columns()?.length
		? $columns().map((c) => c.filter !== false ? buildFilterCol(c) : null).filter((f) => f && f.options)
		: []);

	// QuickFilters uses the same filters list
	let filterCols = $.derived(() => $.get(availableFilters));

	// Always-show placeholders are derived from available filters (no hardcoding)
	// Use reactive array so runes can track changes
	let hiddenPlaceholders = $.state($.proxy([]));

	let activeTitles = $.derived(() => ($parsedTags() || []).map((t) => t.title).filter(Boolean));

	// Compute current placeholders (major filters not already active or dismissed)
	let placeholders = $.derived(() => $.get(availableFilters).filter((f) => !$.get(activeTitles).includes(f.title)).filter((f) => !$.get(hiddenPlaceholders).includes(f.title)));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			direction: 'row',
			gap: 's',
			wrap: 'wrap',
			alignItems: 'center',
			inline: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_4 = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 1, $parsedTags, (tag) => tag.tag, ($$anchor, tag) => {
							var span = root();
							var node_3 = $.child(span);

							{
								let $0 = $.derived(() => Array.isArray($.get(tag).value) ? $.get(tag).value?.length < 3 : true);

								Tooltip(node_3, {
									get disabled() {
										return $.get($0);
									},
									maxWidth: '600px',
									children: ($$anchor, $$slotProps) => {
										CompoundTagRoot($$anchor, {
											size: 's',
											children: ($$anchor, $$slotProps) => {
												const parts = $.derived(() => parseTagParts($.get(tag).tag));
												const property = $.derived(() => $.get(tag).title);
												var fragment_4 = root_2();
												var node_4 = $.first_child(fragment_4);

												$.each(node_4, 17, () => $.get(parts), $.index, ($$anchor, part) => {
													CompoundTagChild($$anchor, {
														children: ($$anchor, $$slotProps) => {
															Menu($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var span_1 = root();
																	var node_5 = $.child(span_1);

																	{
																		var consequent = ($$anchor) => {
																			var fragment_7 = $.comment();
																			var node_6 = $.first_child(fragment_7);

																			$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text) => {
																				Typography_Text($$anchor, {
																					color: '--fgcolor-neutral-secondary',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text = $.text();

																						$.template_effect(() => $.set_text(text, $.get(part).text));
																						$.append($$anchor, text);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_7);
																		};

																		var alternate = ($$anchor) => {
																			var fragment_9 = $.comment();
																			var node_7 = $.first_child(fragment_9);

																			$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																				Typography_Text_1($$anchor, {
																					variant: 'm-500',
																					color: '--fgcolor-neutral-secondary',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_1 = $.text();

																						$.template_effect(($0) => $.set_text(text_1, $0), [
																							() => $.get(part).text.split(' or ').map((t) => capitalize(t)).join(' or ')
																						]);

																						$.append($$anchor, text_1);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_9);
																		};

																		$.if(node_5, ($$render) => {
																			if ($.get(part).operator) $$render(consequent); else $$render(alternate, -1);
																		});
																	}

																	$.reset(span_1);
																	$.append($$anchor, span_1);
																},

																$$slots: {
																	default: true,
																	menu: ($$anchor, $$slotProps) => {
																		var fragment_11 = $.comment();
																		var node_8 = $.first_child(fragment_11);

																		{
																			var consequent_3 = ($$anchor) => {
																				const filter = $.derived(() => getFilterFor($.get(property)));
																				var fragment_12 = $.comment();
																				var node_9 = $.first_child(fragment_12);

																				{
																					var consequent_2 = ($$anchor) => {
																						const isArray = $.derived(() => $.get(filter)?.array);
																						const selectedArray = $.derived(() => Array.isArray($.get(tag).value) ? $.get(tag).value : []);
																						var fragment_13 = $.comment();
																						var node_10 = $.first_child(fragment_13);

																						$.each(node_10, 17, () => $.get(filter).options, (option) => $.get(filter).title + option.value + option.label, ($$anchor, option) => {
																							var fragment_14 = $.comment();
																							var node_11 = $.first_child(fragment_14);

																							$.component(node_11, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
																								ActionMenu_Root($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_15 = $.comment();
																										var node_12 = $.first_child(fragment_15);

																										$.component(node_12, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																											ActionMenu_Item_Button($$anchor, {
																												$$events: {
																													click: () => {
																														if ($.get(isArray)) {
																															const exists = $.get(selectedArray).includes($.get(option).value);

																															const next = exists
																																? $.get(selectedArray).filter((v) => v !== $.get(option).value)
																																: [...$.get(selectedArray), $.get(option).value];

																															addFilterAndApply($.get(filter).id, $.get(filter).title, $.get(filter).operator, null, next, $columns(), analyticsSource());
																														} else {
																															addFilterAndApply($.get(filter).id, $.get(filter).title, $.get(filter).operator, $.get(option).value, [], $columns(), analyticsSource());
																														}
																													}
																												},

																												children: ($$anchor, $$slotProps) => {
																													var fragment_16 = $.comment();
																													var node_13 = $.first_child(fragment_16);

																													$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																														Layout_Stack_1($$anchor, {
																															direction: 'row',
																															gap: 's',
																															children: ($$anchor, $$slotProps) => {
																																var fragment_17 = root_1();
																																var node_14 = $.first_child(fragment_17);

																																{
																																	var consequent_1 = ($$anchor) => {
																																		var fragment_18 = $.comment();
																																		var node_15 = $.first_child(fragment_18);

																																		{
																																			let $0 = $.derived(() => $.get(selectedArray).includes($.get(option).value));

																																			$.component(node_15, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
																																				Selector_Checkbox($$anchor, {
																																					get checked() {
																																						return $.get($0);
																																					},
																																					size: 's'
																																				});
																																			});
																																		}

																																		$.append($$anchor, fragment_18);
																																	};

																																	$.if(node_14, ($$render) => {
																																		if ($.get(isArray)) $$render(consequent_1);
																																	});
																																}

																																var text_2 = $.sibling(node_14);

																																$.template_effect(($0) => $.set_text(text_2, ` ${$0 ?? ''}`), [() => capitalize($.get(option).label)]);
																																$.append($$anchor, fragment_17);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_16);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_15);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_14);
																						});

																						$.append($$anchor, fragment_13);
																					};

																					$.if(node_9, ($$render) => {
																						if ($.get(filter)) $$render(consequent_2);
																					});
																				}

																				$.append($$anchor, fragment_12);
																			};

																			$.if(node_8, ($$render) => {
																				if ($.get(property)) $$render(consequent_3);
																			});
																		}

																		$.append($$anchor, fragment_11);
																	}
																}
															});
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_4, 2);

												CompoundTagChild(node_16, {
													dismiss: true,
													$$events: {
														click: () => {
															const t = $tags().filter((t) => t.tag.includes($.get(tag).title));

															t.forEach((t) => t ? queries.removeFilter(t) : null);
															queries.apply();
															parsedTags.update((tags) => tags.filter((t) => t.tag !== $.get(tag).tag));
														}
													},

													children: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															get icon() {
																return IconX;
															},
															size: 's'
														});
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									},

									$$slots: {
										default: true,
										tooltip: ($$anchor, $$slotProps) => {
											var span_2 = root_3();
											var text_3 = $.only_child(span_2, true);

											$.template_effect(($0) => $.set_text(text_3, $0), [() => $.get(tag)?.value?.toString()]);
											$.append($$anchor, span_2);
										}
									}
								});
							}

							$.reset(span);
							$.append($$anchor, span);
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if ($parsedTags()?.length) $$render(consequent_4);
					});
				}

				var node_17 = $.sibling(node_1, 2);

				{
					var consequent_6 = ($$anchor) => {
						var fragment_20 = $.comment();
						var node_18 = $.first_child(fragment_20);

						$.each(node_18, 17, () => $.get(placeholders), (filter) => filter.title + filter.id, ($$anchor, filter) => {
							var span_3 = root();
							var node_19 = $.child(span_3);

							Menu(node_19, {
								children: ($$anchor, $$slotProps) => {
									CompoundTagRoot($$anchor, {
										size: 's',
										children: ($$anchor, $$slotProps) => {
											var fragment_22 = root_2();
											var node_20 = $.first_child(fragment_22);

											CompoundTagChild(node_20, {
												children: ($$anchor, $$slotProps) => {
													var span_4 = root_4();
													var text_4 = $.only_child(span_4, true);

													$.template_effect(($0) => $.set_text(text_4, $0), [() => capitalize($.get(filter).title)]);
													$.append($$anchor, span_4);
												},
												$$slots: { default: true }
											});

											var node_21 = $.sibling(node_20, 2);

											CompoundTagChild(node_21, {
												dismiss: true,
												$$events: {
													click: (e) => {
														e.stopPropagation();

														if (!$.get(hiddenPlaceholders).includes($.get(filter).title)) {
															$.set(hiddenPlaceholders, [...$.get(hiddenPlaceholders), $.get(filter).title], true);
														}
													}
												},

												children: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														get icon() {
															return IconX;
														},
														size: 's'
													});
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_22);
										},
										$$slots: { default: true }
									});
								},

								$$slots: {
									default: true,
									menu: ($$anchor, $$slotProps) => {
										var fragment_24 = $.comment();
										var node_22 = $.first_child(fragment_24);

										{
											var consequent_5 = ($$anchor) => {
												var fragment_25 = $.comment();
												var node_23 = $.first_child(fragment_25);

												$.each(node_23, 17, () => $.get(filter).options, (option) => $.get(filter).title + option.value + option.label, ($$anchor, option) => {
													var fragment_26 = $.comment();
													var node_24 = $.first_child(fragment_26);

													$.component(node_24, () => ActionMenu.Root, ($$anchor, ActionMenu_Root_1) => {
														ActionMenu_Root_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_27 = $.comment();
																var node_25 = $.first_child(fragment_27);

																$.component(node_25, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																	ActionMenu_Item_Button_1($$anchor, {
																		$$events: {
																			click: () => {
																				addFilterAndApply($.get(filter).id, $.get(filter).title, $.get(filter).operator, $.get(filter)?.array ? null : $.get(option).value, $.get(filter)?.array ? [$.get(option).value] : [], $columns(), analyticsSource());
																			}
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text();

																			$.template_effect(($0) => $.set_text(text_5, $0), [() => capitalize($.get(option).label)]);
																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_27);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_26);
												});

												$.append($$anchor, fragment_25);
											};

											$.if(node_22, ($$render) => {
												if ($.get(filter).options) $$render(consequent_5);
											});
										}

										$.append($$anchor, fragment_24);
									}
								}
							});

							$.reset(span_3);
							$.append($$anchor, span_3);
						});

						$.append($$anchor, fragment_20);
					};

					$.if(node_17, ($$render) => {
						if ($.get(placeholders)?.length) $$render(consequent_6);
					});
				}

				var node_26 = $.sibling(node_17, 2);

				{
					var consequent_7 = ($$anchor) => {
						Button($$anchor, {
							size: 's',
							text: true,
							$$events: {
								click: () => {
									queries.clearAll();
									queries.apply();
									parsedTags.set([]);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Clear all');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_26, ($$render) => {
						if ($parsedTags()?.length) $$render(consequent_7);
					});
				}

				var node_27 = $.sibling(node_26, 2);

				{
					var consequent_8 = ($$anchor) => {
						QuickFilters($$anchor, {
							get columns() {
								return columns();
							},

							get analyticsSource() {
								return analyticsSource();
							},

							get filterCols() {
								return $.get(filterCols);
							}
						});
					};

					$.if(node_27, ($$render) => {
						if ($.get(filterCols)?.length && !$isSmallViewport()) $$render(consequent_8);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}