import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Id, MultiSelectionTable } from '$lib/components';
import { columns } from './store';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import ProviderType from '$routes/(console)/project-[region]-[project]/messaging/providerType.svelte';
import Provider from '$routes/(console)/project-[region]-[project]/messaging/provider.svelte';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { MessagingProviderType } from '@appwrite.io/console';
import { Table } from '@appwrite.io/pink-svelte';

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	async function handleDelete(batchDelete) {
		const result = await batchDelete((id) => sdk.forProject(page.params.region, page.params.project).users.deleteTarget({ userId: page.params.user, targetId: id }));

		try {
			if (result.error) {
				trackError(result.error, Submit.UserTargetDelete);
			} else {
				trackEvent(Submit.UserTargetDelete, { total: result.deleted.length });
			}
		} finally {
			await invalidate(Dependencies.USER_TARGETS);
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
			var fragment_4 = $.comment();
			var node_2 = $.first_child(fragment_4);

			$.each(node_2, 17, () => $$props.data.targets.targets, (target) => target.$id, ($$anchor, target) => {
				const provider = $.derived(() => $$props.data.providersById[$.get(target).providerId]);
				var fragment_5 = $.comment();
				var node_3 = $.first_child(fragment_5);

				$.component(node_3, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
					Table_Row_Base($$anchor, {
						get root() {
							return root();
						},

						get id() {
							return $.get(target).$id;
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
																return $.get(target)[$.get(column).id];
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, $.get(target)[$.get(column).id]));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												};

												var consequent_2 = ($$anchor) => {
													var fragment_12 = $.comment();
													var node_8 = $.first_child(fragment_12);

													{
														var consequent_1 = ($$anchor) => {
															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, $.get(target).name));
															$.append($$anchor, text_2);
														};

														var alternate = ($$anchor) => {
															var text_3 = $.text();

															$.template_effect(() => $.set_text(text_3, $.get(target).identifier));
															$.append($$anchor, text_3);
														};

														$.if(node_8, ($$render) => {
															if ($.get(target).providerType === MessagingProviderType.Push) $$render(consequent_1); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_12);
												};

												var consequent_3 = ($$anchor) => {
													ProviderType($$anchor, {
														get type() {
															return $.get(target).providerType;
														},
														size: 's'
													});
												};

												var consequent_5 = ($$anchor) => {
													var fragment_16 = $.comment();
													var node_9 = $.first_child(fragment_16);

													{
														var consequent_4 = ($$anchor) => {
															Provider($$anchor, {
																get provider() {
																	return $.get(provider).provider;
																}
															});
														};

														$.if(node_9, ($$render) => {
															if ($.get(provider)) $$render(consequent_4);
														});
													}

													$.append($$anchor, fragment_16);
												};

												var consequent_6 = ($$anchor) => {
													DualTimeView($$anchor, {
														get time() {
															return $.get(target)[$.get(column).id];
														}
													});
												};

												var alternate_1 = ($$anchor) => {
													var text_4 = $.text();

													$.template_effect(() => $.set_text(text_4, $.get(target)[$.get(column).id]));
													$.append($$anchor, text_4);
												};

												$.if(node_6, ($$render) => {
													if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'target') $$render(consequent_2, 1); else if ($.get(column).id === 'providerType') $$render(consequent_3, 2); else if ($.get(column).id === 'provider') $$render(consequent_5, 3); else if ($.get(column).id === '$createdAt') $$render(consequent_6, 4); else $$render(alternate_1, -1);
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
			resource: 'target',
			get columns() {
				return $columns();
			},
			onDelete: handleDelete,
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	$.pop();
	$$cleanup();
}