import * as $ from 'svelte/internal/server';
import { EmptySearch, Modal, PaginationInline } from '$lib/components';
import { Button, InputSearch } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { MessagingProviderType, Query } from '@appwrite.io/console';
import { createEventDispatcher } from 'svelte';
import { Badge, Card, Empty, Layout, Selector, Table, Typography } from '@appwrite.io/pink-svelte';
import { getProviderText } from './helper';
import { page } from '$app/state';

export default function TopicsModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			providerType,
			show = void 0,
			topicsById = void 0,
			title = 'Select topics'
		} = $$props;

		const dispatch = createEventDispatcher();
		let offset = 0;
		let search = '';
		let totalResults = 0;
		let emptyTopicsExists = false;
		let selected = {};
		let topicResultsById = {};
		let wasOpen = false;
		let previousSearch = '';

		function getTopicTotal(topic) {
			switch (providerType) {
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
			offset = 0;
			search = '';
		}

		function submit() {
			dispatch('update', selected);
			reset();
		}

		async function request() {
			if (!show) return;

			const queries = [Query.limit(5), Query.offset(offset)];
			const response = await sdk.forProject(page.params.region, page.params.project).messaging.listTopics({ queries, search: search || undefined });

			if (response.total !== 0) {
				switch (providerType) {
					case MessagingProviderType.Email:
						emptyTopicsExists = response.topics.every((topic) => topic.emailTotal === 0);
						break;

					case MessagingProviderType.Sms:
						emptyTopicsExists = response.topics.every((topic) => topic.smsTotal === 0);
						break;

					case MessagingProviderType.Push:
						emptyTopicsExists = response.topics.every((topic) => topic.pushTotal === 0);
						break;
				}
			}

			totalResults = response.total;
			topicResultsById = {};

			response.topics.forEach((topic) => {
				topicResultsById = { ...topicResultsById, [topic.$id]: topic };
			});
		}

		function onTopicSelection(event, topic) {
			const updatedSelected = { ...selected };

			if (event.detail) {
				updatedSelected[topic.$id] = topic;
			} else {
				delete updatedSelected[topic.$id];
			}

			selected = updatedSelected;
		}

		const selectedSize = $.derived(() => Object.keys(selected).length);
		const hasSelection = $.derived(() => selectedSize() > 0);

		const topicsWithState = $.derived(() => Object.entries(topicResultsById).map(([topicId, topic]) => ({
			topicId,
			topic,
			checked: !!selected[topicId],
			disabled: !!topicsById[topicId]
		})));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title,
				onSubmit: submit,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							children: ($$renderer) => {
								InputSearch($$renderer, {
									autofocus: true,
									disabled: totalResults === 0 && !search,
									placeholder: 'Search for topics',
									get value() {
										return search;
									},

									set value($$value) {
										search = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								if (topicsWithState().length > 0 && !emptyTopicsExists) {
									$$renderer.push('<!--[0-->');

									if (Table.Root) {
										$$renderer.push('<!--[-->');

										Table.Root($$renderer, {
											columns: 1,
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$renderer, { root }) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(topicsWithState());

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let { topicId, topic, checked, disabled } = each_array[$$index];

														if (Table.Row.Base) {
															$$renderer.push('<!--[-->');

															Table.Row.Base($$renderer, {
																root,
																children: ($$renderer) => {
																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			root,
																			children: ($$renderer) => {
																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						direction: 'row',
																						alignItems: 'center',
																						gap: 's',
																						children: ($$renderer) => {
																							if (Selector.Checkbox) {
																								$$renderer.push('<!--[-->');
																								Selector.Checkbox($$renderer, { id: topicId, label: topic.name, checked, disabled });
																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` <span>(${$.escape(getTopicTotal(topic))} targets)</span>`);
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
												}
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="u-flex u-main-space-between u-cross-center"><p class="text">Total results: ${$.escape(totalResults)}</p> `);

									PaginationInline($$renderer, {
										limit: 5,
										total: totalResults,
										hidePages: true,
										get offset() {
											return offset;
										},

										set offset($$value) {
											offset = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div>`);
								} else if (search) {
									$$renderer.push('<!--[1-->');

									EmptySearch($$renderer, {
										hidePagination: true,
										search,
										children: ($$renderer) => {
											Button($$renderer, {
												size: 's',
												secondary: true,
												external: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Clear search`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');

									if (Card.Base) {
										$$renderer.push('<!--[-->');

										Card.Base($$renderer, {
											padding: 'none',
											children: ($$renderer) => {
												Empty($$renderer, {
													type: 'secondary',
													title: `You have no topics${emptyTopicsExists ? ` with ${providerType.toLowerCase()} targets` : ''}`,
													description: `Create a topic to see them here.`,
													$$slots: {
														actions: ($$renderer) => {
															Button($$renderer, {
																size: 's',
																slot: 'actions',
																secondary: true,
																external: true,
																href: 'https://appwrite.io/docs/products/messaging/topics',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Documentation`);
																},
																$$slots: { default: true }
															});
														}
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

				$$slots: {
					default: true,
					description: ($$renderer) => {
						{
							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Select existing topics you want to send this message to its targets. The message will be
            sent only to ${$.escape(getProviderText(providerType))} targets.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},

					footer: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									justifyContent: 'flex-end',
									alignItems: 'center',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												inline: true,
												direction: 'row',
												gap: 'xs',
												alignItems: 'center',
												children: ($$renderer) => {
													Badge($$renderer, { variant: 'secondary', content: selectedSize().toString() });
													$$renderer.push(`<!----> <span>Topics selected</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										Button($$renderer, {
											submit: true,
											disabled: !hasSelection(),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create`);
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
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show, topicsById });
	});
}