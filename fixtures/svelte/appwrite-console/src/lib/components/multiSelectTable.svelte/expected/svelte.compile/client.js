import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table, Badge, Typography, FloatingActionBar } from '@appwrite.io/pink-svelte';
import Confirm from './confirm.svelte';
import { Button } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';

var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`Are you sure you want to delete <strong> </strong> `, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function MultiSelectTable($$anchor, $$props) {
	$.push($$props, true);

	let allowSelection = $.prop($$props, 'allowSelection', 3, true),
		confirmDeletion = $.prop($$props, 'confirmDeletion', 3, true),
		showSuccessNotification = $.prop($$props, 'showSuccessNotification', 3, true),
		computeKey = $.prop($$props, 'computeKey', 3, 'multiSelectionTable');

	/**
	 * this is useful when you have a custom deletion logic
	 * and the default `batchDelete` helper doesn't fit the use-case!
	 */
	let selectedRows = $.state($.proxy([]));

	let disableModal = $.state(false);
	let onDeleteError = $.state(null);
	let showConfirmDeletion = $.state(false);

	function notifySuccess(count) {
		if (!showSuccessNotification()) return;
		if (count === 0) return;

		const label = `${$$props.resource}${count > 1 ? 's' : ''}`;

		addNotification({ type: 'success', message: `${count} ${label} deleted` });
	}

	// this is kept very basic!
	function getPluralResource() {
		if ($$props.resource.endsWith('ty')) {
			return `${$$props.resource}ies`;
		}

		return `${$$props.resource}s`;
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
		const state = await $$props.onDelete?.(
			(deleteFn, batchSize) => {
				return batchDelete($.get(selectedRows), deleteFn, batchSize);
			},
			$.get(selectedRows)
		);

		if (!state) {
			return false;
		}

		const deletedCount = state.deleted.length;

		$.set(selectedRows, $.get(selectedRows).filter((id) => !state.deleted.includes(id)), true);

		if (state.error) {
			$.set(onDeleteError, `Some ${getPluralResource()} were not deleted. Error: ${state.error.message}`);

			return false;
		}

		notifySuccess(deletedCount);

		return true;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, computeKey, ($$anchor) => {
		var fragment_1 = root_4();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => Table.Root, ($$anchor, Table_Root) => {
			Table_Root($$anchor, {
				get columns() {
					return $$props.columns;
				},

				get allowSelection() {
					return allowSelection();
				},

				get selectedRows() {
					return $.get(selectedRows);
				},

				set selectedRows($$value) {
					$.set(selectedRows, $$value, true);
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const root = $.derived(() => $$slotProps.root);
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.snippet(node_2, () => $$props.children, () => $.get(root));
						$.append($$anchor, fragment_2);
					},

					header: ($$anchor, $$slotProps) => {
						const root = $.derived(() => $$slotProps.root);
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.snippet(node_3, () => $$props.header ?? $.noop, () => $.get(root));
						$.append($$anchor, fragment_3);
					}
				}
			});
		});

		var node_4 = $.sibling(node_1, 2);

		{
			var consequent = ($$anchor) => {
				FloatingActionBar($$anchor, {
					$$slots: {
						start: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_5 = $.first_child(fragment_5);

							{
								let $0 = $.derived(() => $.get(selectedRows).length.toString());

								Badge(node_5, {
									get content() {
										return $.get($0);
									}
								});
							}

							var span = $.sibling(node_5, 2);
							var text = $.only_child(span);

							$.template_effect(
								($0) => $.set_text(text, `${$0 ?? ''}
                    selected`),
								[
									() => $.get(selectedRows).length > 1 ? getPluralResource() : $$props.resource
								]
							);

							$.append($$anchor, fragment_5);
						},

						end: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var node_6 = $.first_child(fragment_6);

							Button(node_6, {
								text: true,
								$$events: {
									click: () => {
										$$props.onCancel?.();
										$.set(selectedRows, [], true);
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Cancel');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								secondary: true,
								$$events: {
									click: async () => {
										if (confirmDeletion()) {
											$.set(showConfirmDeletion, true);
										} else {
											await consumeDeleteOperation();
										}
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Delete');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						}
					}
				});
			};

			$.if(node_4, ($$render) => {
				if (allowSelection() && $.get(selectedRows).length > 0) $$render(consequent);
			});
		}

		var node_8 = $.sibling(node_4, 2);

		{
			var consequent_3 = ($$anchor) => {
				{
					let $0 = $.derived(getPluralResource);

					Confirm($$anchor, {
						submissionLoader: true,
						confirmDeletion: true,
						get error() {
							return $.get(onDeleteError);
						},

						get disabled() {
							return $.get(disableModal);
						},

						get title() {
							return `Delete ${$.get($0) ?? ''}`;
						},

						onSubmit: async () => {
							$.set(disableModal, true);
							$.set(onDeleteError, null);

							const allDeleted = await consumeDeleteOperation();

							if (allDeleted) {
								$.set(showConfirmDeletion, false);
							}

							$.set(disableModal, false);
						},

						get open() {
							return $.get(showConfirmDeletion);
						},

						set open($$value) {
							$.set(showConfirmDeletion, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_2();
							var node_9 = $.first_child(fragment_8);

							$.component(node_9, () => Typography.Text, ($$anchor, Typography_Text) => {
								Typography_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										const selectionCount = $.derived(() => $.get(selectedRows).length);
										var fragment_9 = $.comment();
										var node_10 = $.first_child(fragment_9);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_10 = $.comment();
												var node_11 = $.first_child(fragment_10);

												$.snippet(node_11, () => $$props.deleteContent, () => $.get(selectionCount));
												$.append($$anchor, fragment_10);
											};

											var alternate = ($$anchor) => {
												var fragment_11 = root_3();
												var strong = $.sibling($.first_child(fragment_11));
												var text_3 = $.only_child(strong, true);
												var text_4 = $.sibling(strong);

												$.template_effect(
													($0) => {
														$.set_text(text_3, $.get(selectionCount));
														$.set_text(text_4, ` ${$0 ?? ''}?`);
													},
													[
														() => $.get(selectionCount) > 1 ? getPluralResource() : $$props.resource
													]
												);

												$.append($$anchor, fragment_11);
											};

											$.if(node_10, ($$render) => {
												if ($$props.deleteContent) $$render(consequent_1); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_9, 2);

							$.component(node_12, () => Typography.Text, ($$anchor, Typography_Text_1) => {
								Typography_Text_1($$anchor, {
									variant: 'm-500',
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = $.comment();
										var node_13 = $.first_child(fragment_12);

										{
											var consequent_2 = ($$anchor) => {
												var fragment_13 = $.comment();
												var node_14 = $.first_child(fragment_13);

												$.snippet(node_14, () => $$props.deleteContentNotice);
												$.append($$anchor, fragment_13);
											};

											var alternate_1 = ($$anchor) => {
												var text_5 = $.text('This action is irreversible.');

												$.append($$anchor, text_5);
											};

											$.if(node_13, ($$render) => {
												if ($$props.deleteContentNotice) $$render(consequent_2); else $$render(alternate_1, -1);
											});
										}

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				}
			};

			$.if(node_8, ($$render) => {
				if (allowSelection() && confirmDeletion()) $$render(consequent_3);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}