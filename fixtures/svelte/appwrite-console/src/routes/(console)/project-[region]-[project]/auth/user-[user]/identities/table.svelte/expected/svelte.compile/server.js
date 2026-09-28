import * as $ from 'svelte/internal/server';
import { Id, MultiSelectionTable } from '$lib/components';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { oAuthProviders } from '$lib/stores/oauth-providers';
import { app } from '$lib/stores/app';
import { base } from '$app/paths';
import { Table } from '@appwrite.io/pink-svelte';
import { page } from '$app/state';

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, columns } = $$props;

		async function handleDelete(batchDelete) {
			const result = await batchDelete((id) => sdk.forProject(page.params.region, page.params.project).users.deleteIdentity({ identityId: id }));

			try {
				if (result.error) {
					trackError(result.error, Submit.UserIdentityDelete);
				} else {
					trackEvent(Submit.UserIdentityDelete, { total: result.deleted.length });
				}
			} finally {
				await invalidate(Dependencies.USER_IDENTITIES);
			}

			return result;
		}

		function getProviderMeta(providerId) {
			const provider = oAuthProviders[providerId];

			return { icon: provider?.icon, name: provider?.name ?? providerId };
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

				const each_array_1 = $.ensure_array_like(data.identities.identities);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let identity = each_array_1[$$index_2];

					if (Table.Row.Base) {
						$$renderer.push('<!--[-->');

						Table.Row.Base($$renderer, {
							root,
							id: identity.$id,
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
															value: identity[column.id],
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(identity[column.id])}`);
															},
															$$slots: { default: true }
														});
													}

													$$renderer.push(`<!---->`);
												} else if (column.id === 'provider') {
													$$renderer.push('<!--[1-->');

													const provider = getProviderMeta(identity[column.id]);

													$$renderer.push(`<div class="u-inline-flex u-cross-center u-gap-8">`);

													if (provider.icon) {
														$$renderer.push(`<!--[0--><div class="avatar is-size-small"><img style="--p-text-size: 1rem" height="20" width="20"${$.attr('src', `${base}/icons/${$.store_get($$store_subs ??= {}, '$app', app).themeInUse}/color/${provider.icon}.svg`)}${$.attr('alt', provider.name)}/></div>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> ${$.escape(provider.name)}</div>`);
												} else if (column.type === 'datetime') {
													$$renderer.push('<!--[2-->');

													if (!identity[column.id]) {
														$$renderer.push(`<!--[0-->-`);
													} else {
														$$renderer.push('<!--[-1-->');
														DualTimeView($$renderer, { time: identity[column.id] });
													}

													$$renderer.push(`<!--]-->`);
												} else {
													$$renderer.push(`<!--[-1-->${$.escape(identity[column.id])}`);
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
				resource: 'identity',
				onDelete: handleDelete,
				header,
				children,
				$$slots: { header: true, default: true }
			});
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}