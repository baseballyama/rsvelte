import * as $ from 'svelte/internal/server';
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

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, columns } = $$props;

		const subscribers = $.derived(() => {
			const record = {};

			for (const subscriber of data.subscribers.subscribers) {
				record[subscriber.$id] = subscriber;
			}

			return record;
		});

		async function handleDelete(batchDelete) {
			const result = await batchDelete(async (subscriberId) => {
				await sdk.forProject(page.params.region, page.params.project).messaging.deleteSubscriber({ topicId: page.params.topic, subscriberId });

				const { target } = subscribers()[subscriberId];
				const { [target.$id]: _, ...rest } = $.store_get($$store_subs ??= {}, '$targetsById', targetsById);

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

				const each_array_1 = $.ensure_array_like(data.subscribers.subscribers);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let subscriber = each_array_1[$$index_2];
					const target = subscriber.target;

					if (Table.Row.Link) {
						$$renderer.push('<!--[-->');

						Table.Row.Link($$renderer, {
							root,
							id: subscriber.$id,
							href: `${base}/project-${$.store_get($$store_subs ??= {}, '$project', project).region}-${$.store_get($$store_subs ??= {}, '$project', project).$id}/auth/user-${subscriber.target.userId}`,
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
															value: subscriber.$id,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(subscriber.$id)}`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!---->`);
												} else if (column.id === 'targetId') {
													$$renderer.push('<!--[1-->');

													Id($$renderer, {
														value: subscriber[column.id],
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(subscriber[column.id])}`);
														},
														$$slots: { default: true }
													});
												} else if (column.id === 'target') {
													$$renderer.push('<!--[2-->');

													if (target.providerType === MessagingProviderType.Push) {
														$$renderer.push(`<!--[0-->${$.escape(target.name)}`);
													} else {
														$$renderer.push(`<!--[-1-->${$.escape(target.identifier)}`);
													}

													$$renderer.push(`<!--]-->`);
												} else if (column.id === 'type') {
													$$renderer.push('<!--[3-->');
													ProviderType($$renderer, { type: subscriber.target.providerType, size: 'xs' });
												} else if (column.id === '$createdAt') {
													$$renderer.push('<!--[4-->');
													DualTimeView($$renderer, { time: subscriber[column.id] });
												} else {
													$$renderer.push(`<!--[-1-->${$.escape(subscriber[column.id])}`);
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
				resource: 'subscriber',
				onDelete: handleDelete,
				header,
				children,
				$$slots: { header: true, default: true }
			});
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}