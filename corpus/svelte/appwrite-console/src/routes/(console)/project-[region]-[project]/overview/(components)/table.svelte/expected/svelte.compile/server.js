import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { Empty, MultiSelectionTable, PaginationWithLimit } from '$lib/components';
import { canWriteKeys } from '$lib/stores/roles';
import { diffDays } from '$lib/helpers/date';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { devKeyColumns, keyColumns } from '../store';
import { Button } from '$lib/elements/forms';
import { Badge, Card, Empty as EmptyState, Layout, Table } from '@appwrite.io/pink-svelte';
import DeleteBatch from './deleteBatch.svelte';
import { capitalize } from '$lib/helpers/string';

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { keyType = 'api', keys, limit, offset } = $$props;
		let selectedKeys = [];
		let showDeleteModal = false;
		const isApiKey = keyType === 'api';
		const label = isApiKey ? 'API' : 'dev';
		const slug = isApiKey ? 'api-keys' : 'dev-keys';

		const columns = isApiKey
			? $.store_get($$store_subs ??= {}, '$keyColumns', keyColumns)
			: $.store_get($$store_subs ??= {}, '$devKeyColumns', devKeyColumns);

		function getApiKeyScopeCount(key) {
			const apiKey = key;

			return apiKey.scopes.length;
		}

		function getExpiryDetails(key) {
			const isExpired = key.expire !== null && new Date(key.expire) < new Date();
			const isExpiring = key.expire && diffDays(new Date(), new Date(key.expire)) < 14;

			return {
				message: isExpired ? 'Expired' : isExpiring ? 'Expires soon' : null,
				status: isExpired
					? isApiKey ? 'error' : 'warning'
					: isExpiring ? 'warning' : null
			};
		}

		function getKeys() {
			if (isApiKey) return keys['keys']; else return keys['devKeys'];
		}

		function getDescription() {
			if (isApiKey) return 'Use API keys to authenticate your app’s requests in production, granting secure access to live data and services.'; else return 'Dev keys allow bypassing rate limits and CORS errors in your development environment.';
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (keys.total) {
				$$renderer.push('<!--[0-->');

				{
					function header($$renderer, root) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(columns);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let column = each_array[$$index];

							if (Table.Header.Cell) {
								$$renderer.push('<!--[-->');

								Table.Header.Cell($$renderer, {
									column: column.id,
									root,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(column.title)}`);
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

						const each_array_1 = $.ensure_array_like(getKeys());

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let key = each_array_1[$$index_1];

							if (Table.Row.Link) {
								$$renderer.push('<!--[-->');

								Table.Row.Link($$renderer, {
									id: key.$id,
									href: `${slug}/${key.$id}`,
									root,
									children: ($$renderer) => {
										if (Table.Cell) {
											$$renderer.push('<!--[-->');

											Table.Cell($$renderer, {
												root,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(key.name)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Table.Cell) {
											$$renderer.push('<!--[-->');

											Table.Cell($$renderer, {
												root,
												children: ($$renderer) => {
													if (key.accessedAt) {
														$$renderer.push('<!--[0-->');
														DualTimeView($$renderer, { time: key.accessedAt });
													} else {
														$$renderer.push(`<!--[-1-->never`);
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

										if (Table.Cell) {
											$$renderer.push('<!--[-->');

											Table.Cell($$renderer, {
												root,
												children: ($$renderer) => {
													const expiration = getExpiryDetails(key);

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															direction: 'row',
															children: ($$renderer) => {
																if (key.expire) {
																	$$renderer.push('<!--[0-->');
																	DualTimeView($$renderer, { time: key.expire });
																} else {
																	$$renderer.push(`<!--[-1-->never`);
																}

																$$renderer.push(`<!--]--> `);

																if (expiration.status) {
																	$$renderer.push('<!--[0-->');

																	Badge($$renderer, {
																		size: 's',
																		variant: 'secondary',
																		type: expiration.status,
																		content: expiration.message
																	});
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

										$$renderer.push(` `);

										if (isApiKey) {
											$$renderer.push('<!--[0-->');

											if (Table.Cell) {
												$$renderer.push('<!--[-->');

												Table.Cell($$renderer, {
													root,
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(getApiKeyScopeCount(key))} Scopes`);
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
						}

						$$renderer.push(`<!--]-->`);
					}

					MultiSelectionTable($$renderer, {
						columns,
						confirmDeletion: false,
						allowSelection: $.store_get($$store_subs ??= {}, '$canWriteKeys', canWriteKeys),
						showSuccessNotification: false,
						resource: `${capitalize(label)} key`,
						onDelete: (_, selectedRows) => {
							showDeleteModal = true;
							selectedKeys = selectedRows;
						},
						header,
						children,
						$$slots: { header: true, default: true }
					});
				}

				$$renderer.push(`<!----> `);

				if (limit !== undefined && offset !== undefined) {
					$$renderer.push('<!--[0-->');

					PaginationWithLimit($$renderer, {
						name: `${capitalize(label)} keys`,
						limit,
						offset,
						total: keys.total
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else if (isApiKey) {
				$$renderer.push('<!--[1-->');

				Empty($$renderer, {
					single: true,
					allowCreate: $.store_get($$store_subs ??= {}, '$canWriteKeys', canWriteKeys),
					href: `https://appwrite.io/docs/advanced/platform/${slug}`,
					target: `${label} key`,
					description: getDescription()
				});
			} else {
				$$renderer.push('<!--[-1-->');

				if (Card.Base) {
					$$renderer.push('<!--[-->');

					Card.Base($$renderer, {
						padding: 'none',
						children: ($$renderer) => {
							EmptyState($$renderer, {
								title: 'No dev keys',
								description: getDescription(),
								$$slots: {
									actions: ($$renderer) => {
										{
											Button($$renderer, {
												external: true,
												href: `https://appwrite.io/docs/advanced/platform/${slug}`,
												text: true,
												size: 's',
												ariaLabel: 'dev keys documentation',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Documentation`);
												},
												$$slots: { default: true }
											});
										}
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

			$$renderer.push(`<!--]--> `);

			DeleteBatch($$renderer, {
				keyType,
				get keyIds() {
					return selectedKeys;
				},

				set keyIds($$value) {
					selectedKeys = $$value;
					$$settled = false;
				},

				get showDelete() {
					return showDeleteModal;
				},

				set showDelete($$value) {
					showDeleteModal = $$value;
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