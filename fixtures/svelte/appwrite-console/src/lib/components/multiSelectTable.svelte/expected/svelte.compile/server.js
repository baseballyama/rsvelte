import * as $ from 'svelte/internal/server';
import { Table, Badge, Typography, FloatingActionBar } from '@appwrite.io/pink-svelte';
import Confirm from './confirm.svelte';
import { Button } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';

export default function MultiSelectTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			columns,
			resource,
			allowSelection = true,
			confirmDeletion = true,
			showSuccessNotification = true,
			computeKey = 'multiSelectionTable',
			header,
			children,
			onDelete,
			onCancel,
			deleteContent,
			deleteContentNotice

			/**
			 * this is useful when you have a custom deletion logic
			 * and the default `batchDelete` helper doesn't fit the use-case!
			 */
		} = $$props;

		let selectedRows = [];
		let disableModal = false;
		let onDeleteError = null;
		let showConfirmDeletion = false;

		function notifySuccess(count) {
			if (!showSuccessNotification) return;
			if (count === 0) return;

			const label = `${resource}${count > 1 ? 's' : ''}`;

			addNotification({ type: 'success', message: `${count} ${label} deleted` });
		}

		// this is kept very basic!
		function getPluralResource() {
			if (resource.endsWith('ty')) {
				return `${resource}ies`;
			}

			return `${resource}s`;
		}

		async function batchDelete(ids, deleteFn, batchSize = undefined) {
			const deleted = [];
			let firstError;

			// prevent infinite loop
			if (batchSize !== undefined) {
				batchSize = Math.max(1, Math.floor(Math.abs(batchSize)));
			}

			async function processBatch(batch) {
				// build promises
				const results = await Promise.allSettled(batch.map((id) => deleteFn(id)));

				results.forEach((result, index) => {
					if (result.status === 'fulfilled') {
						// success, log it!
						deleted.push(batch[index]);
					} else if (!firstError) {
						// error
						firstError = result.reason instanceof Error ? result.reason : new Error(String(result.reason));
					}
				});
			}

			// batch when needed.
			// example: >= 100 items to delete!
			if (batchSize && batchSize < ids.length) {
				for (let i = 0; i < ids.length; i += batchSize) {
					const batch = ids.slice(i, i + batchSize);

					await processBatch(batch);
				}
			} else {
				await processBatch(ids);
			}

			return { deleted, error: firstError };
		}

		async function consumeDeleteOperation() {
			const state = await onDelete?.(
				(deleteFn, batchSize) => {
					return batchDelete(selectedRows, deleteFn, batchSize);
				},
				selectedRows
			);

			if (!state) {
				return false;
			}

			const deletedCount = state.deleted.length;

			selectedRows = selectedRows.filter((id) => !state.deleted.includes(id));

			if (state.error) {
				onDeleteError = `Some ${getPluralResource()} were not deleted. Error: ${state.error.message}`;

				return false;
			}

			notifySuccess(deletedCount);

			return true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<!---->`);

			{
				if (Table.Root) {
					$$renderer.push('<!--[-->');

					Table.Root($$renderer, {
						columns,
						allowSelection,
						get selectedRows() {
							return selectedRows;
						},

						set selectedRows($$value) {
							selectedRows = $$value;
							$$settled = false;
						},
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { root }) => {
								children($$renderer, root);
								$$renderer.push(`<!---->`);
							},

							header: ($$renderer, { root }) => {
								{
									header?.($$renderer, root);
									$$renderer.push(`<!---->`);
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

				if (allowSelection && selectedRows.length > 0) {
					$$renderer.push('<!--[0-->');

					FloatingActionBar($$renderer, {
						$$slots: {
							start: ($$renderer) => {
								{
									Badge($$renderer, { content: selectedRows.length.toString() });

									$$renderer.push(`<!----> <span>${$.escape(selectedRows.length > 1 ? getPluralResource() : resource)}
                    selected</span>`);
								}
							},

							end: ($$renderer) => {
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
										secondary: true,
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
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (allowSelection && confirmDeletion) {
					$$renderer.push('<!--[0-->');

					Confirm($$renderer, {
						submissionLoader: true,
						confirmDeletion: true,
						error: onDeleteError,
						disabled: disableModal,
						title: `Delete ${$.stringify(getPluralResource())}`,
						onSubmit: async () => {
							disableModal = true;
							onDeleteError = null;

							const allDeleted = await consumeDeleteOperation();

							if (allDeleted) {
								showConfirmDeletion = false;
							}

							disableModal = false;
						},

						get open() {
							return showConfirmDeletion;
						},

						set open($$value) {
							showConfirmDeletion = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									children: ($$renderer) => {
										const selectionCount = selectedRows.length;

										if (deleteContent) {
											$$renderer.push('<!--[0-->');
											deleteContent($$renderer, selectionCount);
											$$renderer.push(`<!---->`);
										} else {
											$$renderer.push(`<!--[-1-->Are you sure you want to delete <strong>${$.escape(selectionCount)}</strong> ${$.escape(selectionCount > 1 ? getPluralResource() : resource)}?`);
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

							$$renderer.push(` `);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									variant: 'm-500',
									children: ($$renderer) => {
										if (deleteContentNotice) {
											$$renderer.push('<!--[0-->');
											deleteContentNotice($$renderer);
											$$renderer.push(`<!---->`);
										} else {
											$$renderer.push(`<!--[-1-->This action is irreversible.`);
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
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}