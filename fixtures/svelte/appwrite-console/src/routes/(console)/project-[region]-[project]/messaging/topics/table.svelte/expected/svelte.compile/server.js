import * as $ from 'svelte/internal/server';
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

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, columns } = $$props;

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
			function header($$renderer, root) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(columns);

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

				const each_array_1 = $.ensure_array_like(data.topics.topics);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let topic = each_array_1[$$index_2];

					if (Table.Row.Link) {
						$$renderer.push('<!--[-->');

						Table.Row.Link($$renderer, {
							root,
							id: topic.$id,
							href: `${base}/project-${page.params.region}-${page.params.project}/messaging/topics/topic-${topic.$id}`,
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_2 = $.ensure_array_like(columns);

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
															value: topic.$id,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(topic.$id)}`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!---->`);
												} else if (column.type === 'datetime') {
													$$renderer.push('<!--[1-->');

													if (topic[column.id]) {
														$$renderer.push('<!--[0-->');
														DualTimeView($$renderer, { time: topic[column.id] });
													} else {
														$$renderer.push(`<!--[-1-->-`);
													}

													$$renderer.push(`<!--]-->`);
												} else if (column.id === 'total') {
													$$renderer.push(`<!--[2-->${$.escape(topic.emailTotal + topic.smsTotal + topic.pushTotal)}`);
												} else {
													$$renderer.push(`<!--[-1-->${$.escape(topic[column.id])}`);
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
				columns,
				resource: 'topic',
				onDelete: handleDelete,
				allowSelection: $.store_get($$store_subs ??= {}, '$canWriteTopics', canWriteTopics),
				header,
				children,
				$$slots: { header: true, default: true }
			});
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}