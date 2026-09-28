import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let showFailed = false;
		let errors = [];

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
			const processingMessages = data.messages.messages.filter((message) => message.status === 'processing');

			pollMessagesStatus(processingMessages);
		});

		onDestroy(stopPolling);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					ResponsiveContainerHeader($$renderer, {
						columns,
						hideView: true,
						hasSearch: true,
						hasFilters: true,
						filtersStyle: 'dropdown',
						view: data.view,
						analyticsSource: 'messaging_messages',
						searchPlaceholder: 'Search by description, type, status, or ID',
						children: ($$renderer) => {
							if ($.store_get($$store_subs ??= {}, '$canWriteMessages', canWriteMessages)) {
								$$renderer.push('<!--[0-->');
								CreateMessageDropdown($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (data.messages.total) {
						$$renderer.push('<!--[0-->');

						{
							function header($$renderer, root) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let { id, title } = each_array[$$index];

									if (Table.Header.Cell) {
										$$renderer.push('<!--[-->');

										Table.Header.Cell($$renderer, {
											column: id,
											root,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(title)}`);
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

							function children($$renderer, root) {
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(data.messages.messages);

								for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
									let message = each_array_1[$$index_2];

									if (Table.Row.Link) {
										$$renderer.push('<!--[-->');

										Table.Row.Link($$renderer, {
											root,
											id: message.$id,
											href: `${base}/project-${page.params.region}-${page.params.project}/messaging/message-${message.$id}`,
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

												for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
													let column = each_array_2[$$index_1];

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: column.id,
															root,
															children: ($$renderer) => {
																if (column.id === '$id') {
																	$$renderer.push(`<!--[0--><!---->`);

																	{
																		Id($$renderer, {
																			value: message.$id,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(message.$id)}`);
																			},
																			$$slots: { default: true }
																		});
																	}

																	$$renderer.push(`<!---->`);
																} else if (column.id === 'message') {
																	$$renderer.push('<!--[1-->');

																	if (message.providerType === MessagingProviderType.Push) {
																		$$renderer.push(`<!--[0-->${$.escape(message.data.title)}`);
																	} else if (message.providerType === MessagingProviderType.Sms) {
																		$$renderer.push(`<!--[1-->${$.escape(message.data.content)}`);
																	} else if (message.providerType === MessagingProviderType.Email) {
																		$$renderer.push(`<!--[2-->${$.escape(message.data.subject)}`);
																	} else {
																		$$renderer.push(`<!--[-1-->Invalid provider`);
																	}

																	$$renderer.push(`<!--]-->`);
																} else if (column.id === 'providerType') {
																	$$renderer.push('<!--[2-->');
																	ProviderType($$renderer, { type: message.providerType, size: 'xs' });
																} else if (column.id === 'status') {
																	$$renderer.push('<!--[3-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			gap: 's',
																			children: ($$renderer) => {
																				MessageStatusPill($$renderer, { status: message.status });
																				$$renderer.push(`<!----> `);

																				if (message.status === 'failed') {
																					$$renderer.push('<!--[0-->');

																					if (Link.Button) {
																						$$renderer.push('<!--[-->');

																						Link.Button($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Details`);
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
																} else if (column.type === 'datetime') {
																	$$renderer.push('<!--[4-->');

																	if (!message[column.id]) {
																		$$renderer.push(`<!--[0-->-`);
																	} else {
																		$$renderer.push('<!--[-1-->');
																		DualTimeView($$renderer, { time: message[column.id] });
																	}

																	$$renderer.push(`<!--]-->`);
																} else {
																	$$renderer.push(`<!--[-1-->${$.escape(message[column.id])}`);
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
								}

								$$renderer.push(`<!--]-->`);
							}

							MultiSelectionTable($$renderer, {
								resource: 'message',
								columns: $.store_get($$store_subs ??= {}, '$columns', columns),
								onDelete: handleDelete,
								allowSelection: $.store_get($$store_subs ??= {}, '$canWriteMessages', canWriteMessages),
								header,
								children,
								$$slots: { header: true, default: true }
							});
						}

						$$renderer.push(`<!----> `);

						PaginationWithLimit($$renderer, {
							name: 'Messages',
							limit: data.limit,
							offset: data.offset,
							total: data.messages.total
						});

						$$renderer.push(`<!---->`);
					} else if ($.store_get($$store_subs ??= {}, '$hasPageQueries', hasPageQueries)) {
						$$renderer.push('<!--[1-->');
						EmptyFilter($$renderer, { resource: 'messages' });
					} else if (data.search) {
						$$renderer.push('<!--[2-->');

						EmptySearch($$renderer, {
							target: 'messages',
							search: data.search,
							children: ($$renderer) => {
								$$renderer.push(`<div class="u-flex u-gap-16">`);

								Button($$renderer, {
									external: true,
									href: 'https://appwrite.io/docs/products/messaging/messages',
									text: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Documentation`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									secondary: true,
									href: `${base}/project-${page.params.region}-${page.params.project}/messaging`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear search`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							target: 'message',
							$$slots: {
								actions: ($$renderer) => {
									{
										Button($$renderer, {
											external: true,
											text: true,
											ariaLabel: 'read message documentation',
											event: 'empty_documentation',
											href: 'https://appwrite.io/docs/products/messaging/messages',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Documentation`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if ($.store_get($$store_subs ??= {}, '$canWriteMessages', canWriteMessages)) {
											$$renderer.push('<!--[0-->');

											CreateMessageDropdown($$renderer, {
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$renderer, { toggle }) => {
														Button($$renderer, {
															secondary: true,
															event: 'create_message',
															children: ($$renderer) => {
																$$renderer.push(`<span class="text">Create message</span>`);
															},
															$$slots: { default: true }
														});
													}
												}
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}
								}
							}
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			FailedModal($$renderer, {
				errors,
				get show() {
					return showFailed;
				},

				set show($$value) {
					showFailed = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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