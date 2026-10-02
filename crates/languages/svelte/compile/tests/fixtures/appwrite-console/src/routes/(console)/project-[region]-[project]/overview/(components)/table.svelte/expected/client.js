import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $keyColumns = () => $.store_get(keyColumns, '$keyColumns', $$stores);
	const $devKeyColumns = () => $.store_get(devKeyColumns, '$devKeyColumns', $$stores);
	const $canWriteKeys = () => $.store_get(canWriteKeys, '$canWriteKeys', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let keyType = $.prop($$props, 'keyType', 3, 'api');
	let selectedKeys = $.state($.proxy([]));
	let showDeleteModal = $.state(false);
	const isApiKey = keyType() === 'api';
	const label = isApiKey ? 'API' : 'dev';
	const slug = isApiKey ? 'api-keys' : 'dev-keys';
	const columns = isApiKey ? $keyColumns() : $devKeyColumns();

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
		if (isApiKey) return $$props.keys['keys']; else return $$props.keys['devKeys'];
	}

	function getDescription() {
		if (isApiKey) return 'Use API keys to authenticate your app’s requests in production, granting secure access to live data and services.'; else return 'Dev keys allow bypassing rate limits and CORS errors in your development environment.';
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			{
				const header = ($$anchor, root = $.noop) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.each(node_2, 17, () => columns, $.index, ($$anchor, column) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
							Table_Header_Cell($$anchor, {
								get column() {
									return $.get(column).id;
								},

								get root() {
									return root();
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(column).title));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					});

					$.append($$anchor, fragment_2);
				};

				const children = ($$anchor, root = $.noop) => {
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					$.each(node_4, 17, getKeys, (key) => key.$id, ($$anchor, key) => {
						var fragment_6 = $.comment();
						var node_5 = $.first_child(fragment_6);

						{
							let $0 = $.derived(() => `${slug}/${$.get(key).$id}`);

							$.component(node_5, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
								Table_Row_Link($$anchor, {
									get id() {
										return $.get(key).$id;
									},

									get href() {
										return $.get($0);
									},

									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_2();
										var node_6 = $.first_child(fragment_7);

										$.component(node_6, () => Table.Cell, ($$anchor, Table_Cell) => {
											Table_Cell($$anchor, {
												get root() {
													return root();
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(key).name));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Table.Cell, ($$anchor, Table_Cell_1) => {
											Table_Cell_1($$anchor, {
												get root() {
													return root();
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_8 = $.first_child(fragment_9);

													{
														var consequent = ($$anchor) => {
															DualTimeView($$anchor, {
																get time() {
																	return $.get(key).accessedAt;
																}
															});
														};

														var alternate = ($$anchor) => {
															var text_2 = $.text('never');

															$.append($$anchor, text_2);
														};

														$.if(node_8, ($$render) => {
															if ($.get(key).accessedAt) $$render(consequent); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell_2) => {
											Table_Cell_2($$anchor, {
												get root() {
													return root();
												},

												children: ($$anchor, $$slotProps) => {
													const expiration = $.derived(() => getExpiryDetails($.get(key)));
													var fragment_11 = $.comment();
													var node_10 = $.first_child(fragment_11);

													$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack) => {
														Layout_Stack($$anchor, {
															gap: 's',
															direction: 'row',
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = root_1();
																var node_11 = $.first_child(fragment_12);

																{
																	var consequent_1 = ($$anchor) => {
																		DualTimeView($$anchor, {
																			get time() {
																				return $.get(key).expire;
																			}
																		});
																	};

																	var alternate_1 = ($$anchor) => {
																		var text_3 = $.text('never');

																		$.append($$anchor, text_3);
																	};

																	$.if(node_11, ($$render) => {
																		if ($.get(key).expire) $$render(consequent_1); else $$render(alternate_1, -1);
																	});
																}

																var node_12 = $.sibling(node_11, 2);

																{
																	var consequent_2 = ($$anchor) => {
																		Badge($$anchor, {
																			size: 's',
																			variant: 'secondary',
																			get type() {
																				return $.get(expiration).status;
																			},

																			get content() {
																				return $.get(expiration).message;
																			}
																		});
																	};

																	$.if(node_12, ($$render) => {
																		if ($.get(expiration).status) $$render(consequent_2);
																	});
																}

																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_9, 2);

										{
											var consequent_3 = ($$anchor) => {
												var fragment_15 = $.comment();
												var node_14 = $.first_child(fragment_15);

												$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_3) => {
													Table_Cell_3($$anchor, {
														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text();

															$.template_effect(($0) => $.set_text(text_4, `${$0 ?? ''} Scopes`), [() => getApiKeyScopeCount($.get(key))]);
															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_15);
											};

											$.if(node_13, ($$render) => {
												if (isApiKey) $$render(consequent_3);
											});
										}

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_6);
					});

					$.append($$anchor, fragment_5);
				};

				let $0 = $.derived(() => `${capitalize(label)} key`);

				MultiSelectionTable(node_1, {
					get columns() {
						return columns;
					},
					confirmDeletion: false,
					get allowSelection() {
						return $canWriteKeys();
					},
					showSuccessNotification: false,
					get resource() {
						return $.get($0);
					},

					onDelete: (_, selectedRows) => {
						$.set(showDeleteModal, true);
						$.set(selectedKeys, selectedRows, true);
					},
					header,
					children,
					$$slots: { header: true, default: true }
				});
			}

			var node_15 = $.sibling(node_1, 2);

			{
				var consequent_4 = ($$anchor) => {
					{
						let $0 = $.derived(() => `${capitalize(label)} keys`);

						PaginationWithLimit($$anchor, {
							get name() {
								return $.get($0);
							},

							get limit() {
								return $$props.limit;
							},

							get offset() {
								return $$props.offset;
							},

							get total() {
								return $$props.keys.total;
							}
						});
					}
				};

				$.if(node_15, ($$render) => {
					if ($$props.limit !== undefined && $$props.offset !== undefined) $$render(consequent_4);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var consequent_6 = ($$anchor) => {
			{
				let $0 = $.derived(getDescription);

				Empty($$anchor, {
					single: true,
					get allowCreate() {
						return $canWriteKeys();
					},

					get href() {
						return `https://appwrite.io/docs/advanced/platform/${slug}`;
					},

					get target() {
						return `${label} key`;
					},

					get description() {
						return $.get($0);
					},

					$$events: {
						click: async () => {
							await goto(`${base}/project-${page.params.region}-${page.params.project}/overview/${slug}/create`);
						}
					}
				});
			}
		};

		var alternate_2 = ($$anchor) => {
			var fragment_19 = $.comment();
			var node_16 = $.first_child(fragment_19);

			$.component(node_16, () => Card.Base, ($$anchor, Card_Base) => {
				Card_Base($$anchor, {
					padding: 'none',
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(getDescription);

							EmptyState($$anchor, {
								title: 'No dev keys',
								get description() {
									return $.get($0);
								},

								$$slots: {
									actions: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											external: true,
											get href() {
												return `https://appwrite.io/docs/advanced/platform/${slug}`;
											},
											text: true,
											size: 's',
											ariaLabel: 'dev keys documentation',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Documentation');

												$.append($$anchor, text_5);
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

			$.append($$anchor, fragment_19);
		};

		$.if(node, ($$render) => {
			if ($$props.keys.total) $$render(consequent_5); else if (isApiKey) $$render(consequent_6, 1); else $$render(alternate_2, -1);
		});
	}

	var node_17 = $.sibling(node, 2);

	DeleteBatch(node_17, {
		get keyType() {
			return keyType();
		},

		get keyIds() {
			return $.get(selectedKeys);
		},

		set keyIds($$value) {
			$.set(selectedKeys, $$value, true);
		},

		get showDelete() {
			return $.get(showDeleteModal);
		},

		set showDelete($$value) {
			$.set(showDeleteModal, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}