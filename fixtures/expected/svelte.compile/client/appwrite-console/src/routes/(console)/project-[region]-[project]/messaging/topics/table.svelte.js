import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Id, MultiSelectionTable } from '$lib/components';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { page } from '$app/state';
import { canWriteTopics } from '$lib/stores/roles';
import { Table } from '@appwrite.io/pink-svelte';

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteTopics = () => $.store_get(canWriteTopics, '$canWriteTopics', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	async function handleDelete(batchDelete) {
		const result = await batchDelete((id) => sdk.forProject(page.params.region, page.params.project).messaging.deleteTopic({ topicId: id }));

		try {
			if (result.error) {
				trackError(result.error, Submit.MessagingTopicDelete);
			} else {
				trackEvent(Submit.MessagingTopicDelete, { total: result.deleted.length });
			}
		} finally {
			await invalidate(Dependencies.MESSAGING_TOPICS);
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

			$.each(node_2, 17, () => $$props.data.topics.topics, (topic) => topic.$id, ($$anchor, topic) => {
				var fragment_5 = $.comment();
				var node_3 = $.first_child(fragment_5);

				{
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/messaging/topics/topic-${$.get(topic).$id}`);

					$.component(node_3, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
						Table_Row_Link($$anchor, {
							get root() {
								return root();
							},

							get id() {
								return $.get(topic).$id;
							},

							get href() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_4 = $.first_child(fragment_6);

								$.each(node_4, 17, () => $$props.columns, (column) => column.id, ($$anchor, column) => {
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
																	return $.get(topic).$id;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, $.get(topic).$id));
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
																DualTimeView($$anchor, {
																	get time() {
																		return $.get(topic)[$.get(column).id];
																	}
																});
															};

															var alternate = ($$anchor) => {
																var text_2 = $.text('-');

																$.append($$anchor, text_2);
															};

															$.if(node_8, ($$render) => {
																if ($.get(topic)[$.get(column).id]) $$render(consequent_1); else $$render(alternate, -1);
															});
														}

														$.append($$anchor, fragment_12);
													};

													var consequent_3 = ($$anchor) => {
														var text_3 = $.text();

														$.template_effect(() => $.set_text(text_3, $.get(topic).emailTotal + $.get(topic).smsTotal + $.get(topic).pushTotal));
														$.append($$anchor, text_3);
													};

													var alternate_1 = ($$anchor) => {
														var text_4 = $.text();

														$.template_effect(() => $.set_text(text_4, $.get(topic)[$.get(column).id]));
														$.append($$anchor, text_4);
													};

													$.if(node_6, ($$render) => {
														if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).type === 'datetime') $$render(consequent_2, 1); else if ($.get(column).id === 'total') $$render(consequent_3, 2); else $$render(alternate_1, -1);
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
			resource: 'topic',
			onDelete: handleDelete,
			get allowSelection() {
				return $canWriteTopics();
			},
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	$.pop();
	$$cleanup();
}