import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Modal } from '$lib/components';
import { Button, InputCheckbox } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { Query } from '@appwrite.io/console';
import { Spinner, Table } from '@appwrite.io/pink-svelte';
import { resolveRoute } from '$lib/stores/navigation';
import { getTerminologies } from '$database/(entity)';

export default function Delete($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { showDelete = false } = $$props;
		let error = null;
		let confirmedDeletion = false;
		let isLoadingRowsCount = false;
		let entityItems = [];
		let entities = null;
		const { databaseSdk } = getTerminologies();
		const database = $.derived(() => page.data.database);

		function buildQueries() {
			const queries = [Query.orderDesc('$updatedAt')];

			if (entityItems.length > 0) {
				queries.push(Query.limit(25));
				queries.push(Query.offset(entityItems.length));
			} else {
				queries.push(Query.limit(3));
			}

			return queries;
		}

		async function listEntities() {
			// let's just wait...
			if (isLoadingRowsCount) return;

			isLoadingRowsCount = true;

			try {
				const queries = buildQueries();

				entities = await databaseSdk.listEntities({ databaseId: page.params.database, queries });

				const entityInfo = entities.entities.map((entity) => {
					return {
						id: entity.$id,
						name: entity.name,
						updatedAt: entity.$updatedAt
					};
				});

				entityItems = [...entityItems, ...entityInfo];
			} catch(err) {
				error = true;
			} finally {
				isLoadingRowsCount = false;
			}
		}

		const handleDelete = async () => {
			try {
				await databaseSdk.delete({ databaseId: page.params.database });
				showDelete = false;

				addNotification({
					type: 'success',
					message: `${database().name} has been deleted`
				});

				trackEvent(Submit.DatabaseDelete);
				await goto(resolveRoute('/(console)/project-[region]-[project]/databases', page.params));
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.DatabaseDelete);
			}
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Delete database',
				onSubmit: handleDelete,
				get show() {
					return showDelete;
				},

				set show($$value) {
					showDelete = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (isLoadingRowsCount) {
						$$renderer.push(`<!--[0--><div class="u-flex u-main-center">`);
						Spinner($$renderer, {});
						$$renderer.push(`<!----></div>`);
					} else if (error) {
						$$renderer.push(`<!--[1--><p class="text">Are you sure you want to delete <b>${$.escape(database().name)}</b>?</p>`);
					} else if (entityItems.length > 0) {
						$$renderer.push(`<!--[2--><div class="u-flex-vertical u-gap-16">`);

						if (Table.Root) {
							$$renderer.push('<!--[-->');

							Table.Root($$renderer, {
								columns: 2,
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { root }) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(entityItems);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let table = each_array[$$index];

											if (Table.Row.Base) {
												$$renderer.push('<!--[-->');

												Table.Row.Base($$renderer, {
													root,
													children: ($$renderer) => {
														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																root,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(table.name)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																root,
																children: ($$renderer) => {
																	DualTimeView($$renderer, { time: table.updatedAt });
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

										$$renderer.push(`<!--]-->`);
									},

									header: ($$renderer, { root }) => {
										{
											if (Table.Header.Cell) {
												$$renderer.push('<!--[-->');

												Table.Header.Cell($$renderer, {
													root,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Table`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Header.Cell) {
												$$renderer.push('<!--[-->');

												Table.Header.Cell($$renderer, {
													root,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Last Updated`);
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

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (entityItems.length < entities.total) {
							$$renderer.push(`<!--[0--><div class="u-flex u-gap-16 u-cross-center"><button class="u-underline" type="button">Show more</button> `);

							if (isLoadingRowsCount) {
								$$renderer.push(`<!--[0--><div class="loader is-small"></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else if (entityItems.length > 25) {
							$$renderer.push(`<!--[1--><button class="u-underline" type="button">Show less</button>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (!isLoadingRowsCount) {
						$$renderer.push(`<!--[0--><p class="text" data-private=""><b>Once deleted, this database and its backups cannot be restored. This action is
                irreversible.</b></p> <div class="input-check-box-friction">`);

						InputCheckbox($$renderer, {
							required: true,
							id: 'delete_database',
							label: 'I understand and confirm',
							get checked() {
								return confirmedDeletion;
							},

							set checked($$value) {
								confirmedDeletion = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},

				$$slots: {
					default: true,
					description: ($$renderer) => {
						$$renderer.push(`<p class="text" slot="description">`);

						if (entityItems.length > 0) {
							$$renderer.push(`<!--[0-->The following tables and all data associated with <b>${$.escape(database().name)}</b>, will be
            permanently deleted.`);
						} else {
							$$renderer.push(`<!--[-1-->Are you sure you want to delete <b>${$.escape(database().name)}</b>?`);
						}

						$$renderer.push(`<!--]--></p>`);
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								danger: true,
								submit: true,
								disabled: !confirmedDeletion,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { showDelete });
	});
}