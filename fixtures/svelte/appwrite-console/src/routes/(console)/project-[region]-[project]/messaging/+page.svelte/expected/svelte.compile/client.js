import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';

import {
	Empty,
	EmptyFilter,
	EmptySearch,
	Id,
	MultiSelectionTable,
	PaginationWithLimit
} from '$lib/components';

import { hasPageQueries } from '$lib/components/filters';
import { Button } from '$lib/elements/forms';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { Container, ResponsiveContainerHeader } from '$lib/layout';
import { MessagingProviderType } from '@appwrite.io/console';
import CreateMessageDropdown from './createMessageDropdown.svelte';
import FailedModal from './failedModal.svelte';
import MessageStatusPill from './messageStatusPill.svelte';
import ProviderType from './providerType.svelte';
import { showCreate } from './store';
import { sdk } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { writable } from 'svelte/store';
import { canWriteMessages } from '$lib/stores/roles';
import { Layout, Link, Table } from '@appwrite.io/pink-svelte';
import { onDestroy, onMount } from 'svelte';
import { stopPolling, pollMessagesStatus } from './helper';

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="u-flex u-gap-16"><!> <!></div>`);
var root_3 = $.from_html(`<span class="text">Create message</span>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteMessages = () => $.store_get(canWriteMessages, '$canWriteMessages', $$stores);
	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const $hasPageQueries = () => $.store_get(hasPageQueries, '$hasPageQueries', $$stores);
	const $showCreate = () => $.store_get(showCreate, '$showCreate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showFailed = $.state(false);
	let errors = $.state($.proxy([]));

	const columns = writable([
		{ id: '$id', title: 'Message ID', type: 'string', width: 200 },
		{
			id: 'message',
			title: 'Message',
			type: 'string',
			hide: true,
			filter: false,
			width: { min: 140 }
		},

		{
			id: 'providerType',
			title: 'Type',
			type: 'string',
			width: { min: 100 },
			array: true,
			format: 'enum',
			elements: [
				{ value: 'email', label: 'Email' },
				{ value: 'sms', label: 'SMS' },
				{ value: 'push', label: 'Push' }
			]
		},

		{
			id: 'status',
			title: 'Status',
			type: 'enum',
			width: { min: 120 },
			array: true,
			format: 'enum',
			elements: ['draft', 'scheduled', 'processing', 'sent', 'failed']
		},

		{
			id: 'scheduledAt',
			title: 'Scheduled at',
			type: 'datetime',
			width: { min: 120 },
			format: 'datetime',
			elements: [
				{ value: 5 * 60 * 1000, label: 'last 5 minutes' },
				{ value: 60 * 60 * 1000, label: 'last 1 hour' },
				{ value: 24 * 60 * 60 * 1000, label: 'last 24 hours' },
				{ value: 7 * 24 * 60 * 60 * 1000, label: 'last 7 days' },
				{ value: 30 * 24 * 60 * 60 * 1000, label: 'last 30 days' }
			]
		},

		{
			id: 'deliveredAt',
			title: 'Delivered at',
			type: 'datetime',
			width: { min: 120 },
			format: 'datetime',
			elements: [
				{ value: 5 * 60 * 1000, label: 'last 5 minutes' },
				{ value: 60 * 60 * 1000, label: 'last 1 hour' },
				{ value: 24 * 60 * 60 * 1000, label: 'last 24 hours' },
				{ value: 7 * 24 * 60 * 60 * 1000, label: 'last 7 days' },
				{ value: 30 * 24 * 60 * 60 * 1000, label: 'last 30 days' }
			]
		}
	]);

	async function handleDelete(batchDelete) {
		const result = await batchDelete((id) => sdk.forProject(page.params.region, page.params.project).messaging.delete({ messageId: id }));

		try {
			if (result.error) {
				trackError(result.error, Submit.MessagingMessageDelete);
			} else {
				trackEvent(Submit.MessagingMessageDelete, { total: result.deleted.length });
			}
		} finally {
			await invalidate(Dependencies.MESSAGING_MESSAGES);
		}

		return result;
	}

	onMount(() => {
		const processingMessages = $$props.data.messages.messages.filter((message) => message.status === 'processing');

		pollMessagesStatus(processingMessages);
	});

	onDestroy(stopPolling);

	var fragment = root_1();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			ResponsiveContainerHeader(node_1, {
				get columns() {
					return columns;
				},
				hideView: true,
				hasSearch: true,
				hasFilters: true,
				filtersStyle: 'dropdown',
				get view() {
					return $$props.data.view;
				},
				analyticsSource: 'messaging_messages',
				searchPlaceholder: 'Search by description, type, status, or ID',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							CreateMessageDropdown($$anchor, {});
						};

						$.if(node_2, ($$render) => {
							if ($canWriteMessages()) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			{
				var consequent_11 = ($$anchor) => {
					var fragment_4 = root_1();
					var node_4 = $.first_child(fragment_4);

					{
						const header = ($$anchor, root = $.noop) => {
							var fragment_5 = $.comment();
							var node_5 = $.first_child(fragment_5);

							$.each(node_5, 1, $columns, $.index, ($$anchor, $$item) => {
								let id = () => $.get($$item).id;
								let title = () => $.get($$item).title;
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
									Table_Header_Cell($$anchor, {
										get column() {
											return id();
										},

										get root() {
											return root();
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, title()));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							});

							$.append($$anchor, fragment_5);
						};

						const children = ($$anchor, root = $.noop) => {
							var fragment_8 = $.comment();
							var node_7 = $.first_child(fragment_8);

							$.each(node_7, 17, () => $$props.data.messages.messages, (message) => message.$id, ($$anchor, message) => {
								var fragment_9 = $.comment();
								var node_8 = $.first_child(fragment_9);

								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/messaging/message-${$.get(message).$id}`);

									$.component(node_8, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
										Table_Row_Link($$anchor, {
											get root() {
												return root();
											},

											get id() {
												return $.get(message).$id;
											},

											get href() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_10 = $.comment();
												var node_9 = $.first_child(fragment_10);

												$.each(node_9, 1, $columns, (column) => column.id, ($$anchor, column) => {
													var fragment_11 = $.comment();
													var node_10 = $.first_child(fragment_11);

													$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															get column() {
																return $.get(column).id;
															},

															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_12 = $.comment();
																var node_11 = $.first_child(fragment_12);

																{
																	var consequent_1 = ($$anchor) => {
																		var fragment_13 = $.comment();
																		var node_12 = $.first_child(fragment_13);

																		$.key(node_12, $columns, ($$anchor) => {
																			Id($$anchor, {
																				get value() {
																					return $.get(message).$id;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text();

																					$.template_effect(() => $.set_text(text_1, $.get(message).$id));
																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_13);
																	};

																	var consequent_5 = ($$anchor) => {
																		var fragment_16 = $.comment();
																		var node_13 = $.first_child(fragment_16);

																		{
																			var consequent_2 = ($$anchor) => {
																				var text_2 = $.text();

																				$.template_effect(() => $.set_text(text_2, $.get(message).data.title));
																				$.append($$anchor, text_2);
																			};

																			var consequent_3 = ($$anchor) => {
																				var text_3 = $.text();

																				$.template_effect(() => $.set_text(text_3, $.get(message).data.content));
																				$.append($$anchor, text_3);
																			};

																			var consequent_4 = ($$anchor) => {
																				var text_4 = $.text();

																				$.template_effect(() => $.set_text(text_4, $.get(message).data.subject));
																				$.append($$anchor, text_4);
																			};

																			var alternate = ($$anchor) => {
																				var text_5 = $.text('Invalid provider');

																				$.append($$anchor, text_5);
																			};

																			$.if(node_13, ($$render) => {
																				if ($.get(message).providerType === MessagingProviderType.Push) $$render(consequent_2); else if ($.get(message).providerType === MessagingProviderType.Sms) $$render(consequent_3, 1); else if ($.get(message).providerType === MessagingProviderType.Email) $$render(consequent_4, 2); else $$render(alternate, -1);
																			});
																		}

																		$.append($$anchor, fragment_16);
																	};

																	var consequent_6 = ($$anchor) => {
																		ProviderType($$anchor, {
																			get type() {
																				return $.get(message).providerType;
																			},
																			size: 'xs'
																		});
																	};

																	var consequent_8 = ($$anchor) => {
																		var fragment_21 = $.comment();
																		var node_14 = $.first_child(fragment_21);

																		$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack) => {
																			Layout_Stack($$anchor, {
																				direction: 'row',
																				gap: 's',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_22 = root_1();
																					var node_15 = $.first_child(fragment_22);

																					MessageStatusPill(node_15, {
																						get status() {
																							return $.get(message).status;
																						}
																					});

																					var node_16 = $.sibling(node_15, 2);

																					{
																						var consequent_7 = ($$anchor) => {
																							var fragment_23 = $.comment();
																							var node_17 = $.first_child(fragment_23);

																							$.component(node_17, () => Link.Button, ($$anchor, Link_Button) => {
																								Link_Button($$anchor, {
																									$$events: {
																										click: (e) => {
																											e.preventDefault();
																											$.set(errors, $.get(message).deliveryErrors, true);
																											$.set(showFailed, true);
																										}
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_6 = $.text('Details');

																										$.append($$anchor, text_6);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_23);
																						};

																						$.if(node_16, ($$render) => {
																							if ($.get(message).status === 'failed') $$render(consequent_7);
																						});
																					}

																					$.append($$anchor, fragment_22);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_21);
																	};

																	var consequent_10 = ($$anchor) => {
																		var fragment_24 = $.comment();
																		var node_18 = $.first_child(fragment_24);

																		{
																			var consequent_9 = ($$anchor) => {
																				var text_7 = $.text('-');

																				$.append($$anchor, text_7);
																			};

																			var alternate_1 = ($$anchor) => {
																				DualTimeView($$anchor, {
																					get time() {
																						return $.get(message)[$.get(column).id];
																					}
																				});
																			};

																			$.if(node_18, ($$render) => {
																				if (!$.get(message)[$.get(column).id]) $$render(consequent_9); else $$render(alternate_1, -1);
																			});
																		}

																		$.append($$anchor, fragment_24);
																	};

																	var alternate_2 = ($$anchor) => {
																		var text_8 = $.text();

																		$.template_effect(() => $.set_text(text_8, $.get(message)[$.get(column).id]));
																		$.append($$anchor, text_8);
																	};

																	$.if(node_11, ($$render) => {
																		if ($.get(column).id === '$id') $$render(consequent_1); else if ($.get(column).id === 'message') $$render(consequent_5, 1); else if ($.get(column).id === 'providerType') $$render(consequent_6, 2); else if ($.get(column).id === 'status') $$render(consequent_8, 3); else if ($.get(column).type === 'datetime') $$render(consequent_10, 4); else $$render(alternate_2, -1);
																	});
																}

																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_9);
							});

							$.append($$anchor, fragment_8);
						};

						MultiSelectionTable(node_4, {
							resource: 'message',
							get columns() {
								return $columns();
							},
							onDelete: handleDelete,
							get allowSelection() {
								return $canWriteMessages();
							},
							header,
							children,
							$$slots: { header: true, default: true }
						});
					}

					var node_19 = $.sibling(node_4, 2);

					PaginationWithLimit(node_19, {
						name: 'Messages',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.messages.total;
						}
					});

					$.append($$anchor, fragment_4);
				};

				var consequent_12 = ($$anchor) => {
					EmptyFilter($$anchor, { resource: 'messages' });
				};

				var consequent_13 = ($$anchor) => {
					EmptySearch($$anchor, {
						target: 'messages',
						get search() {
							return $$props.data.search;
						},

						children: ($$anchor, $$slotProps) => {
							var div = root_2();
							var node_20 = $.child(div);

							Button(node_20, {
								external: true,
								href: 'https://appwrite.io/docs/products/messaging/messages',
								text: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Documentation');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_20, 2);

							{
								let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/messaging`);

								Button(node_21, {
									secondary: true,
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text('Clear search');

										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				};

				var alternate_3 = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						target: 'message',
						$$events: { click: () => $.store_set(showCreate, true) },
						$$slots: {
							actions: ($$anchor, $$slotProps) => {
								var fragment_30 = root_1();
								var node_22 = $.first_child(fragment_30);

								Button(node_22, {
									external: true,
									text: true,
									ariaLabel: 'read message documentation',
									event: 'empty_documentation',
									href: 'https://appwrite.io/docs/products/messaging/messages',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_11 = $.text('Documentation');

										$.append($$anchor, text_11);
									},
									$$slots: { default: true }
								});

								var node_23 = $.sibling(node_22, 2);

								{
									var consequent_14 = ($$anchor) => {
										CreateMessageDropdown($$anchor, {
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const toggle = $.derived(() => $$slotProps.toggle);

													Button($$anchor, {
														secondary: true,
														event: 'create_message',
														$$events: {
															click: function (...$$args) {
																$.get(toggle)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															var span = root_3();

															$.append($$anchor, span);
														},
														$$slots: { default: true }
													});
												}
											}
										});
									};

									$.if(node_23, ($$render) => {
										if ($canWriteMessages()) $$render(consequent_14);
									});
								}

								$.append($$anchor, fragment_30);
							}
						}
					});
				};

				$.if(node_3, ($$render) => {
					if ($$props.data.messages.total) $$render(consequent_11); else if ($hasPageQueries()) $$render(consequent_12, 1); else if ($$props.data.search) $$render(consequent_13, 2); else $$render(alternate_3, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node, 2);

	FailedModal(node_24, {
		get errors() {
			return $.get(errors);
		},

		get show() {
			return $.get(showFailed);
		},

		set show($$value) {
			$.set(showFailed, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}