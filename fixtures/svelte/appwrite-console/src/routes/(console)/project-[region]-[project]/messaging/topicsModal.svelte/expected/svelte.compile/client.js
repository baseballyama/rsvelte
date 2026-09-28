import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { EmptySearch, Modal, PaginationInline } from '$lib/components';
import { Button, InputSearch } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { MessagingProviderType, Query } from '@appwrite.io/console';
import { createEventDispatcher } from 'svelte';
import { Badge, Card, Empty, Layout, Selector, Table, Typography } from '@appwrite.io/pink-svelte';
import { getProviderText } from './helper';
import { page } from '$app/state';

var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <div class="u-flex u-main-space-between u-cross-center"><p class="text"> </p> <!></div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <span>Topics selected</span>`, 1);

export default function TopicsModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15),
		title = $.prop($$props, 'title', 3, 'Select topics');

	const dispatch = createEventDispatcher();
	let offset = $.state(0);
	let search = $.state('');
	let totalResults = $.state(0);
	let emptyTopicsExists = $.state(false);
	let selected = $.state($.proxy({}));
	let topicResultsById = $.state($.proxy({}));
	let wasOpen = $.state(false);
	let previousSearch = $.state('');

	function getTopicTotal(topic) {
		switch ($$props.providerType) {
			case MessagingProviderType.Email:
				return topic.emailTotal;

			case MessagingProviderType.Sms:
				return topic.smsTotal;

			case MessagingProviderType.Push:
				return topic.pushTotal;

			default:
				return 0;
		}
	}

	function reset() {
		$.set(offset, 0);
		$.set(search, '');
	}

	function submit() {
		dispatch('update', $.get(selected));
		reset();
	}

	async function request() {
		if (!show()) return;

		const queries = [Query.limit(5), Query.offset($.get(offset))];
		const response = await sdk.forProject(page.params.region, page.params.project).messaging.listTopics({ queries, search: $.get(search) || undefined });

		if (response.total !== 0) {
			switch ($$props.providerType) {
				case MessagingProviderType.Email:
					$.set(emptyTopicsExists, response.topics.every((topic) => topic.emailTotal === 0), true);
					break;

				case MessagingProviderType.Sms:
					$.set(emptyTopicsExists, response.topics.every((topic) => topic.smsTotal === 0), true);
					break;

				case MessagingProviderType.Push:
					$.set(emptyTopicsExists, response.topics.every((topic) => topic.pushTotal === 0), true);
					break;
			}
		}

		$.set(totalResults, response.total, true);
		$.set(topicResultsById, {}, true);

		response.topics.forEach((topic) => {
			$.set(topicResultsById, { ...$.get(topicResultsById), [topic.$id]: topic }, true);
		});
	}

	function onTopicSelection(event, topic) {
		const updatedSelected = { ...$.get(selected) };

		if (event.detail) {
			updatedSelected[topic.$id] = topic;
		} else {
			delete updatedSelected[topic.$id];
		}

		$.set(selected, updatedSelected, true);
	}

	const selectedSize = $.derived(() => Object.keys($.get(selected)).length);
	const hasSelection = $.derived(() => $.get(selectedSize) > 0);

	const topicsWithState = $.derived(() => Object.entries($.get(topicResultsById)).map(([topicId, topic]) => ({
		topicId,
		topic,
		checked: !!$.get(selected)[topicId],
		disabled: !!$$props.topicsById[topicId]
	})));

	$.user_effect(() => {
		const searchChanged = $.get(search) !== $.get(previousSearch);

		if (searchChanged) {
			$.set(previousSearch, $.get(search), true);
			$.set(offset, 0);
		}
	});

	$.user_effect(() => {
		const hasValidData = $.get(offset) !== null || $.get(search) !== null;
		const shouldFetch = show() && hasValidData;

		if (shouldFetch) {
			request();
		}
	});

	$.user_effect(() => {
		const isOpening = show() && !$.get(wasOpen);

		if (isOpening) {
			$.set(selected, $$props.topicsById, true);
		}

		$.set(wasOpen, show(), true);
	});

	Modal($$anchor, {
		get title() {
			return title();
		},
		onSubmit: submit,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},
		$$events: { close: reset },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => $.get(totalResults) === 0 && !$.get(search));

							InputSearch(node_1, {
								autofocus: true,
								get disabled() {
									return $.get($0);
								},
								placeholder: 'Search for topics',
								get value() {
									return $.get(search);
								},

								set value($$value) {
									$.set(search, $$value, true);
								}
							});
						}

						var node_2 = $.sibling(node_1, 2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = root_2();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Table.Root, ($$anchor, Table_Root) => {
									Table_Root($$anchor, {
										columns: 1,
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.each(node_4, 17, () => $.get(topicsWithState), ({ topicId, topic, checked, disabled }) => topicId, ($$anchor, $$item) => {
													let topicId = () => $.get($$item).topicId;
													let topic = () => $.get($$item).topic;
													let checked = () => $.get($$item).checked;
													let disabled = () => $.get($$item).disabled;
													var fragment_5 = $.comment();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
														Table_Row_Base($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_6 = $.first_child(fragment_6);

																$.component(node_6, () => Table.Cell, ($$anchor, Table_Cell) => {
																	Table_Cell($$anchor, {
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = $.comment();
																			var node_7 = $.first_child(fragment_7);

																			$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																				Layout_Stack_1($$anchor, {
																					direction: 'row',
																					alignItems: 'center',
																					gap: 's',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_8 = root_1();
																						var node_8 = $.first_child(fragment_8);

																						$.component(node_8, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
																							Selector_Checkbox($$anchor, {
																								get id() {
																									return topicId();
																								},

																								get label() {
																									return topic().name;
																								},

																								get checked() {
																									return checked();
																								},

																								get disabled() {
																									return disabled();
																								},
																								$$events: { change: (event) => onTopicSelection(event, topic()) }
																							});
																						});

																						var span = $.sibling(node_8, 2);
																						var text = $.only_child(span);

																						$.template_effect(($0) => $.set_text(text, `(${$0 ?? ''} targets)`), [() => getTopicTotal(topic())]);
																						$.append($$anchor, fragment_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												});

												$.append($$anchor, fragment_4);
											}
										}
									});
								});

								var div = $.sibling(node_3, 2);
								var p = $.child(div);
								var text_1 = $.only_child(p);
								var node_9 = $.sibling(p, 2);

								PaginationInline(node_9, {
									limit: 5,
									get total() {
										return $.get(totalResults);
									},
									hidePages: true,
									get offset() {
										return $.get(offset);
									},

									set offset($$value) {
										$.set(offset, $$value, true);
									}
								});

								$.reset(div);
								$.template_effect(() => $.set_text(text_1, `Total results: ${$.get(totalResults) ?? ''}`));
								$.append($$anchor, fragment_3);
							};

							var consequent_1 = ($$anchor) => {
								EmptySearch($$anchor, {
									hidePagination: true,
									get search() {
										return $.get(search);
									},

									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											size: 's',
											secondary: true,
											external: true,
											$$events: { click: () => $.set(search, '') },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Clear search');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							};

							var alternate = ($$anchor) => {
								var fragment_11 = $.comment();
								var node_10 = $.first_child(fragment_11);

								$.component(node_10, () => Card.Base, ($$anchor, Card_Base) => {
									Card_Base($$anchor, {
										padding: 'none',
										children: ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => `You have no topics${$.get(emptyTopicsExists)
													? ` with ${$$props.providerType.toLowerCase()} targets`
													: ''}`);

												Empty($$anchor, {
													type: 'secondary',
													get title() {
														return $.get($0);
													},
													description: `Create a topic to see them here.`,
													$$slots: {
														actions: ($$anchor, $$slotProps) => {
															Button($$anchor, {
																size: 's',
																slot: 'actions',
																secondary: true,
																external: true,
																href: 'https://appwrite.io/docs/products/messaging/topics',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('Documentation');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														}
													}
												});
											}
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_11);
							};

							$.if(node_2, ($$render) => {
								if ($.get(topicsWithState).length > 0 && !$.get(emptyTopicsExists)) $$render(consequent); else if ($.get(search)) $$render(consequent_1, 1); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			description: ($$anchor, $$slotProps) => {
				var fragment_14 = $.comment();
				var node_11 = $.first_child(fragment_14);

				$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text) => {
					Typography_Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(
								($0) => $.set_text(text_4, `Select existing topics you want to send this message to its targets. The message will be
            sent only to ${$0 ?? ''} targets.`),
								[() => getProviderText($$props.providerType)]
							);

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_14);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_16 = $.comment();
				var node_12 = $.first_child(fragment_16);

				$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
					Layout_Stack_2($$anchor, {
						direction: 'row',
						justifyContent: 'flex-end',
						alignItems: 'center',
						children: ($$anchor, $$slotProps) => {
							var fragment_17 = root_3();
							var node_13 = $.first_child(fragment_17);

							$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
								Layout_Stack_3($$anchor, {
									inline: true,
									direction: 'row',
									gap: 'xs',
									alignItems: 'center',
									children: ($$anchor, $$slotProps) => {
										var fragment_18 = root_4();
										var node_14 = $.first_child(fragment_18);

										{
											let $0 = $.derived(() => $.get(selectedSize).toString());

											Badge(node_14, {
												variant: 'secondary',
												get content() {
													return $.get($0);
												}
											});
										}

										$.next(2);
										$.append($$anchor, fragment_18);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_13, 2);

							{
								let $0 = $.derived(() => !$.get(hasSelection));

								Button(node_15, {
									submit: true,
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Create');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_16);
			}
		}
	});

	$.pop();
}