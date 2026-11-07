import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { base } from '$app/paths';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Id, MultiSelectionTable } from '$lib/components';
import { Dependencies } from '$lib/constants';
import ProviderType from '../../providerType.svelte';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';
import { targetsById } from '../../store';
import { MessagingProviderType } from '@appwrite.io/console';
import { Table } from '@appwrite.io/pink-svelte';

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $targetsById = () => $.store_get(targetsById, '$targetsById', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const subscribers = $.derived(() => {
		const record = {};

		for (const subscriber of $$props.data.subscribers.subscribers) {
			record[subscriber.$id] = subscriber;
		}

		return record;
	});

	async function handleDelete(batchDelete) {
		const result = await batchDelete(async (subscriberId) => {
			await sdk.forProject(page.params.region, page.params.project).messaging.deleteSubscriber({ topicId: page.params.topic, subscriberId });

			const { target } = $.get(subscribers)[subscriberId];
			const { [target.$id]: _, ...rest } = $targetsById();

			$.store_set(targetsById, rest);
		});

		try {
			if (result.error) {
				trackError(result.error, Submit.MessagingTopicSubscriberDelete);
			} else {
				trackEvent(Submit.MessagingTopicSubscriberDelete, { total: result.deleted.length });
			}
		} finally {
			await invalidate(Dependencies.MESSAGING_TOPIC_SUBSCRIBERS);
		}

		return result;
	}

	{
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => $$props.columns, $.index, ($$anchor, $$item) => {
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

			$.each(node_2, 17, () => $$props.data.subscribers.subscribers, (subscriber) => subscriber.$id, ($$anchor, subscriber) => {
				const target = $.derived(() => $.get(subscriber).target);
				var fragment_5 = $.comment();
				var node_3 = $.first_child(fragment_5);

				{
					let $0 = $.derived(() => `${base}/project-${$project().region}-${$project().$id}/auth/user-${$.get(subscriber).target.userId}`);

					$.component(node_3, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
						Table_Row_Link($$anchor, {
							get root() {
								return root();
							},

							get id() {
								return $.get(subscriber).$id;
							},

							get href() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_4 = $.first_child(fragment_6);

								$.each(node_4, 17, () => $$props.columns, $.index, ($$anchor, column) => {
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

														$.key(node_7, () => $.get(column).id, ($$anchor) => {
															Id($$anchor, {
																get value() {
																	return $.get(subscriber).$id;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $.get(subscriber).$id));
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													};

													var consequent_1 = ($$anchor) => {
														Id($$anchor, {
															get value() {
																return $.get(subscriber)[$.get(column).id];
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text();

																$.template_effect(() => $.set_text(text_2, $.get(subscriber)[$.get(column).id]));
																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													};

													var consequent_3 = ($$anchor) => {
														var fragment_14 = $.comment();
														var node_8 = $.first_child(fragment_14);

														{
															var consequent_2 = ($$anchor) => {
																var text_3 = $.text();

																$.template_effect(() => $.set_text(text_3, $.get(target).name));
																$.append($$anchor, text_3);
															};

															var alternate = ($$anchor) => {
																var text_4 = $.text();

																$.template_effect(() => $.set_text(text_4, $.get(target).identifier));
																$.append($$anchor, text_4);
															};

															$.if(node_8, ($$render) => {
																if ($.get(target).providerType === MessagingProviderType.Push) $$render(consequent_2); else $$render(alternate, -1);
															});
														}

														$.append($$anchor, fragment_14);
													};

													var consequent_4 = ($$anchor) => {
														ProviderType($$anchor, {
															get type() {
																return $.get(subscriber).target.providerType;
															},
															size: 'xs'
														});
													};

													var consequent_5 = ($$anchor) => {
														DualTimeView($$anchor, {
															get time() {
																return $.get(subscriber)[$.get(column).id];
															}
														});
													};

													var alternate_1 = ($$anchor) => {
														var text_5 = $.text();

														$.template_effect(() => $.set_text(text_5, $.get(subscriber)[$.get(column).id]));
														$.append($$anchor, text_5);
													};

													$.if(node_6, ($$render) => {
														if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'targetId') $$render(consequent_1, 1); else if ($.get(column).id === 'target') $$render(consequent_3, 2); else if ($.get(column).id === 'type') $$render(consequent_4, 3); else if ($.get(column).id === '$createdAt') $$render(consequent_5, 4); else $$render(alternate_1, -1);
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
				}

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		};

		MultiSelectionTable($$anchor, {
			get columns() {
				return $$props.columns;
			},
			resource: 'subscriber',
			onDelete: handleDelete,
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	$.pop();
	$$cleanup();
}