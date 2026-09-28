import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Id, MultiSelectionTable } from '$lib/components';
import { columns } from './store';
import Provider from '../provider.svelte';
import ProviderType from '../providerType.svelte';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { canWriteProviders } from '$lib/stores/roles';
import { Badge, Icon, Table } from '@appwrite.io/pink-svelte';
import { IconCheckCircle } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const $canWriteProviders = () => $.store_get(canWriteProviders, '$canWriteProviders', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	async function handleDelete(batchDelete) {
		const result = await batchDelete((id) => sdk.forProject(page.params.region, page.params.project).messaging.deleteProvider({ providerId: id }));

		try {
			if (result.error) {
				trackError(result.error, Submit.MessagingProviderDelete);
			} else {
				trackEvent(Submit.MessagingProviderDelete, { total: result.deleted.length });
			}
		} finally {
			await invalidate(Dependencies.MESSAGING_PROVIDERS);
		}

		return result;
	}

	{
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 1, $columns, $.index, ($$anchor, $$item) => {
				let id = () => $.get($$item).id;
				let title = () => $.get($$item).title;
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
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

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		const children = ($$anchor, root = $.noop) => {
			const TableRowComponent = $.derived(() => $canWriteProviders() ? Table.Row.Link : Table.Row.Base);
			var fragment_4 = $.comment();
			var node_2 = $.first_child(fragment_4);

			$.each(node_2, 17, () => $$props.data.providers.providers, (provider) => provider.$id, ($$anchor, provider) => {
				const href = $.derived(() => $canWriteProviders()
					? `${base}/project-${page.params.region}-${page.params.project}/messaging/providers/provider-${$.get(provider).$id}`
					: undefined);

				var fragment_5 = $.comment();
				var node_3 = $.first_child(fragment_5);

				$.component(node_3, () => $.get(TableRowComponent), ($$anchor, TableRowComponent_1) => {
					TableRowComponent_1($$anchor, {
						get href() {
							return $.get(href);
						},

						get root() {
							return root();
						},

						get id() {
							return $.get(provider).$id;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_4 = $.first_child(fragment_6);

							$.each(node_4, 1, $columns, $.index, ($$anchor, column) => {
								var fragment_7 = $.comment();
								var node_5 = $.first_child(fragment_7);

								$.component(node_5, () => Table.Cell, ($$anchor, Table_Cell) => {
									Table_Cell($$anchor, {
										get column() {
											return $.get(column).id;
										},

										get root() {
											return root();
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_8 = $.comment();
											var node_6 = $.first_child(fragment_8);

											{
												var consequent = ($$anchor) => {
													var fragment_9 = $.comment();
													var node_7 = $.first_child(fragment_9);

													$.key(node_7, $columns, ($$anchor) => {
														Id($$anchor, {
															get value() {
																return $.get(provider).$id;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, $.get(provider).$id));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												};

												var consequent_1 = ($$anchor) => {
													Provider($$anchor, {
														get provider() {
															return $.get(provider).provider;
														}
													});
												};

												var consequent_2 = ($$anchor) => {
													ProviderType($$anchor, {
														get type() {
															return $.get(provider).type;
														},
														size: 'xs'
													});
												};

												var consequent_4 = ($$anchor) => {
													{
														let $0 = $.derived(() => $.get(provider).enabled ? 'success' : undefined);
														let $1 = $.derived(() => $.get(provider).enabled ? 'enabled' : 'disabled');

														Badge($$anchor, {
															variant: 'secondary',
															get type() {
																return $.get($0);
															},

															get content() {
																return $.get($1);
															},

															$$slots: {
																start: ($$anchor, $$slotProps) => {
																	var fragment_15 = $.comment();
																	var node_8 = $.first_child(fragment_15);

																	{
																		var consequent_3 = ($$anchor) => {
																			Icon($$anchor, {
																				get icon() {
																					return IconCheckCircle;
																				},
																				size: 's'
																			});
																		};

																		$.if(node_8, ($$render) => {
																			if ($.get(provider).enabled) $$render(consequent_3);
																		});
																	}

																	$.append($$anchor, fragment_15);
																}
															}
														});
													}
												};

												var alternate = ($$anchor) => {
													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, $.get(provider)[$.get(column).id]));
													$.append($$anchor, text_2);
												};

												$.if(node_6, ($$render) => {
													if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'provider') $$render(consequent_1, 1); else if ($.get(column).id === 'type') $$render(consequent_2, 2); else if ($.get(column).id === 'enabled') $$render(consequent_4, 3); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		};

		MultiSelectionTable($$anchor, {
			resource: 'provider',
			get columns() {
				return $columns();
			},
			onDelete: handleDelete,
			get allowSelection() {
				return $canWriteProviders();
			},
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	$.pop();
	$$cleanup();
}