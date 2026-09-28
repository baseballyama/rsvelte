import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { isRelationship } from '../rows/store';
import Confirm from '$lib/components/confirm.svelte';
import { Layout } from '@appwrite.io/pink-svelte';

export default function DeleteColumn($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { table, showDelete = false, selectedColumn = null } = $$props;
		let error = null;
		const selectedColumns = $.derived(() => Array.isArray(selectedColumn) ? selectedColumn : [selectedColumn]);
		const selectedKeys = $.derived(() => selectedColumns().map((c) => typeof c === 'string' ? c : c.key));
		const requiresTwoWayConfirm = $.derived(() => selectedColumns().filter((c) => typeof c !== 'string').some((col) => isRelationship(col) && col.twoWay));

		async function handleDelete() {
			try {
				const client = sdk.forProject(page.params.region, page.params.project);

				await Promise.all(selectedKeys().map((key) => client.tablesDB.deleteColumn({
					databaseId: page.params.database,
					tableId: page.params.table,
					key
				})));

				trackEvent(Submit.ColumnDelete);

				addNotification({
					type: 'success',
					message: selectedColumns().length === 1
						? 'Column has been deleted'
						: `${selectedColumns().length} columns have been deleted`
				});

				showDelete = false;
				selectedColumn = Array.isArray(selectedColumn) ? [] : null;
			} catch(e) {
				error = e.message;
				trackError(e, Submit.ColumnDelete);
			}
		}

		function getAsRelationship(column) {
			return column;
		}

		const relatedColumn = $.derived(() => requiresTwoWayConfirm() ? getAsRelationship(selectedColumns()[0]) : undefined);

		const confirmDeletionLabel = $.derived(() => !requiresTwoWayConfirm()
			? 'I understand and confirm'
			: `Delete relationship between ${relatedColumn().key} to ${relatedColumn().twoWayKey}`);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Confirm($$renderer, {
				onSubmit: handleDelete,
				title: 'Delete column',
				confirmDeletion: true,
				confirmDeletionLabel: confirmDeletionLabel(),
				get open() {
					return showDelete;
				},

				set open($$value) {
					showDelete = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (selectedColumns().length === 1) {
						$$renderer.push(`<!--[0--><p>Are you sure you want to delete <b data-private="">${$.escape(selectedKeys()[0])}</b> from <b data-private="">${$.escape(table.name)}</b>?</p>`);
					} else {
						$$renderer.push(`<!--[-1--><p>Are you sure you want to delete <b data-private="">${$.escape(selectedKeys().join(', '))}</b> from <b data-private="">${$.escape(table.name)}</b>?</p>`);
					}

					$$renderer.push(`<!--]--> `);

					if (requiresTwoWayConfirm()) {
						$$renderer.push('<!--[0-->');

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'column',
								gap: 'xl',
								children: ($$renderer) => {
									$$renderer.push(`<p>This is a two way relationship and the corresponding relationship will also be
                deleted.</p> <p><b>This action is irreversible.</b></p>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { showDelete, selectedColumn });
	});
}