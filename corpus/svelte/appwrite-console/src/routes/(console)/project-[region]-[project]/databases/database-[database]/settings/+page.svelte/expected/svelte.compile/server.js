import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { BoxAvatar, CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, Helper, InputText } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import { Container } from '$lib/layout';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import Delete from '../delete.svelte';
import { Query } from '@appwrite.io/console';
import { Layout, Skeleton } from '@appwrite.io/pink-svelte';
import { getTerminologies } from '$database/(entity)';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const database = $.derived(() => data.database);
		let showDelete = false;
		let databaseName = null;
		let errorMessage = 'Something went wrong';
		let errorType = 'error';
		let showError = false;
		const { databaseSdk, terminology } = getTerminologies();

		onMount(async () => {
			databaseName ??= database().name;
		});

		async function loadEntityCount() {
			const { total } = await databaseSdk.listEntities({ databaseId: page.params.database, queries: [Query.limit(1)] });

			return total;
		}

		function addError(location, message, type) {
			errorType = type;
			showError = location;
			errorMessage = message;
		}

		async function updateName() {
			try {
				await sdk.forProject(page.params.region, page.params.project).tablesDB.update({ databaseId: page.params.database, name: databaseName });
				await invalidate(Dependencies.DATABASE);
				addNotification({ message: 'Name has been updated', type: 'success' });
				trackEvent(Submit.DatabaseUpdateName);
			} catch(error) {
				addError('name', error.message, 'error');
				trackError(error, Submit.DatabaseUpdateName);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (database()) {
				$$renderer.push('<!--[0-->');

				Container($$renderer, {
					databasesMainScreen: true,
					children: ($$renderer) => {
						CardGrid($$renderer, {
							$$slots: {
								title: ($$renderer) => {
									{
										$$renderer.push(`${$.escape(database().name)}`);
									}
								},

								aside: ($$renderer) => {
									{
										$$renderer.push(`<div class="grid-1-2-col-2"><p>Created: ${$.escape(toLocaleDateTime(database().$createdAt))}</p> <p>Last updated: ${$.escape(toLocaleDateTime(database().$updatedAt))}</p></div>`);
									}
								}
							}
						});

						$$renderer.push(`<!----> `);

						Form($$renderer, {
							onSubmit: updateName,
							children: ($$renderer) => {
								CardGrid($$renderer, {
									$$slots: {
										title: ($$renderer) => {
											{
												$$renderer.push(`Name`);
											}
										},

										aside: ($$renderer) => {
											{
												$$renderer.push(`<ul>`);

												InputText($$renderer, {
													id: 'name',
													label: 'Name',
													placeholder: 'Enter database name',
													autocomplete: false,
													required: true,
													get value() {
														return databaseName;
													},

													set value($$value) {
														databaseName = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												if (showError === 'name') {
													$$renderer.push('<!--[0-->');

													Helper($$renderer, {
														type: errorType,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(errorMessage)}`);
														},
														$$slots: { default: true }
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></ul>`);
											}
										},

										actions: ($$renderer) => {
											{
												Button($$renderer, {
													disabled: databaseName === database().name || !databaseName,
													submit: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Update`);
													},
													$$slots: { default: true }
												});
											}
										}
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						CardGrid($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->The database will be permanently deleted, including all ${$.escape(terminology.entity.lower.plural)} within it. This action is irreversible.`);
							},

							$$slots: {
								default: true,
								title: ($$renderer) => {
									{
										$$renderer.push(`Delete database`);
									}
								},

								aside: ($$renderer) => {
									{
										BoxAvatar($$renderer, {
											$$slots: {
												title: ($$renderer) => {
													{
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																direction: 'column',
																gap: 'xxs',
																children: ($$renderer) => {
																	$$renderer.push(`<h6 class="u-bold u-trim-1">${$.escape(database().name)}</h6> `);

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			gap: 's',
																			children: ($$renderer) => {
																				$.await(
																					$$renderer,
																					loadEntityCount(),
																					() => {
																						Skeleton($$renderer, { variant: 'line', width: '100%', height: 19.5 });
																					},
																					(count) => {
																						const entity = terminology.entity.title;

																						$$renderer.push(`${$.escape(count)}
                                    ${$.escape(count === 1 ? entity.singular : entity.plural)}`);
																					}
																				);

																				$$renderer.push(`<!--]-->`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}
												}
											}
										});
									}
								},

								actions: ($$renderer) => {
									{
										Button($$renderer, {
											secondary: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Delete`);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Delete($$renderer, {
					get showDelete() {
						return showDelete;
					},

					set showDelete($$value) {
						showDelete = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}