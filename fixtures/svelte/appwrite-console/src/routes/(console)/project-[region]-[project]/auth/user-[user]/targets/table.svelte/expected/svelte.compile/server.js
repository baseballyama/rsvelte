import * as $ from 'svelte/internal/server';
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

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;

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

				const each_array_1 = $.ensure_array_like(data.targets.targets);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let target = each_array_1[$$index_2];
					const provider = data.providersById[target.providerId];

					if (Table.Row.Base) {
						$$renderer.push('<!--[-->');

						Table.Row.Base($$renderer, {
							root,
							id: target.$id,
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
															value: target[column.id],
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(target[column.id])}`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!---->`);
												} else if (column.id === 'target') {
													$$renderer.push('<!--[1-->');

													if (target.providerType === MessagingProviderType.Push) {
														$$renderer.push(`<!--[0-->${$.escape(target.name)}`);
													} else {
														$$renderer.push(`<!--[-1-->${$.escape(target.identifier)}`);
													}

													$$renderer.push(`<!--]-->`);
												} else if (column.id === 'providerType') {
													$$renderer.push('<!--[2-->');
													ProviderType($$renderer, { type: target.providerType, size: 's' });
												} else if (column.id === 'provider') {
													$$renderer.push('<!--[3-->');

													if (provider) {
														$$renderer.push('<!--[0-->');
														Provider($$renderer, { provider: provider.provider });
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												} else if (column.id === '$createdAt') {
													$$renderer.push('<!--[4-->');
													DualTimeView($$renderer, { time: target[column.id] });
												} else {
													$$renderer.push(`<!--[-1-->${$.escape(target[column.id])}`);
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
				resource: 'target',
				columns: $.store_get($$store_subs ??= {}, '$columns', columns),
				onDelete: handleDelete,
				header,
				children,
				$$slots: { header: true, default: true }
			});
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}