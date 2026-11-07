import * as $ from 'svelte/internal/server';
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

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;

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
				const TableRowComponent = $.store_get($$store_subs ??= {}, '$canWriteProviders', canWriteProviders) ? Table.Row.Link : Table.Row.Base;

				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(data.providers.providers);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let provider = each_array_1[$$index_2];

					const href = $.store_get($$store_subs ??= {}, '$canWriteProviders', canWriteProviders)
						? `${base}/project-${page.params.region}-${page.params.project}/messaging/providers/provider-${provider.$id}`
						: undefined;

					if (TableRowComponent) {
						$$renderer.push('<!--[-->');

						TableRowComponent($$renderer, {
							href,
							root,
							id: provider.$id,
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
															value: provider.$id,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(provider.$id)}`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!---->`);
												} else if (column.id === 'provider') {
													$$renderer.push('<!--[1-->');
													Provider($$renderer, { provider: provider.provider });
												} else if (column.id === 'type') {
													$$renderer.push('<!--[2-->');
													ProviderType($$renderer, { type: provider.type, size: 'xs' });
												} else if (column.id === 'enabled') {
													$$renderer.push('<!--[3-->');

													Badge($$renderer, {
														variant: 'secondary',
														type: provider.enabled ? 'success' : undefined,
														content: provider.enabled ? 'enabled' : 'disabled',
														$$slots: {
															start: ($$renderer) => {
																{
																	if (provider.enabled) {
																		$$renderer.push('<!--[0-->');
																		Icon($$renderer, { icon: IconCheckCircle, size: 's' });
																	} else {
																		$$renderer.push('<!--[-1-->');
																	}

																	$$renderer.push(`<!--]-->`);
																}
															}
														}
													});
												} else {
													$$renderer.push(`<!--[-1-->${$.escape(provider[column.id])}`);
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
				resource: 'provider',
				columns: $.store_get($$store_subs ??= {}, '$columns', columns),
				onDelete: handleDelete,
				allowSelection: $.store_get($$store_subs ??= {}, '$canWriteProviders', canWriteProviders),
				header,
				children,
				$$slots: { header: true, default: true }
			});
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}