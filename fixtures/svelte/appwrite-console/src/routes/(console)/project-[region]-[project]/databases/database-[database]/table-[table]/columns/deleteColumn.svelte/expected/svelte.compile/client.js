import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { isRelationship } from '../rows/store';
import Confirm from '$lib/components/confirm.svelte';
import { Layout } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<p>Are you sure you want to delete <b data-private=""> </b> from <b data-private=""> </b>?</p>`);

var root_1 = $.from_html(
	`<p>This is a two way relationship and the corresponding relationship will also be
                deleted.</p> <p><b>This action is irreversible.</b></p>`,
	1
);

var root_2 = $.from_html(`<!> <!>`, 1);

export default function DeleteColumn($$anchor, $$props) {
	$.push($$props, true);

	let showDelete = $.prop($$props, 'showDelete', 15, false),
		selectedColumn = $.prop($$props, 'selectedColumn', 15, null);

	let error = $.state(null);
	const selectedColumns = $.derived(() => Array.isArray(selectedColumn()) ? selectedColumn() : [selectedColumn()]);
	const selectedKeys = $.derived(() => $.get(selectedColumns).map((c) => typeof c === 'string' ? c : c.key));
	const requiresTwoWayConfirm = $.derived(() => $.get(selectedColumns).filter((c) => typeof c !== 'string').some((col) => isRelationship(col) && col.twoWay));

	async function handleDelete() {
		try {
			const client = sdk.forProject(page.params.region, page.params.project);

			await Promise.all($.get(selectedKeys).map((key) => client.tablesDB.deleteColumn({
				databaseId: page.params.database,
				tableId: page.params.table,
				key
			})));

			trackEvent(Submit.ColumnDelete);

			addNotification({
				type: 'success',
				message: $.get(selectedColumns).length === 1
					? 'Column has been deleted'
					: `${$.get(selectedColumns).length} columns have been deleted`
			});

			showDelete(false);
			selectedColumn(Array.isArray(selectedColumn()) ? [] : null);
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.ColumnDelete);
		}
	}

	function getAsRelationship(column) {
		return column;
	}

	const relatedColumn = $.derived(() => $.get(requiresTwoWayConfirm)
		? getAsRelationship($.get(selectedColumns)[0])
		: undefined);

	const confirmDeletionLabel = $.derived(() => !$.get(requiresTwoWayConfirm)
		? 'I understand and confirm'
		: `Delete relationship between ${$.get(relatedColumn).key} to ${$.get(relatedColumn).twoWayKey}`);

	Confirm($$anchor, {
		onSubmit: handleDelete,
		title: 'Delete column',
		confirmDeletion: true,
		get confirmDeletionLabel() {
			return $.get(confirmDeletionLabel);
		},

		get open() {
			return showDelete();
		},

		set open($$value) {
			showDelete($$value);
		},

		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var b = $.sibling($.child(p));
					var text = $.only_child(b, true);
					var b_1 = $.sibling(b, 2);
					var text_1 = $.only_child(b_1, true);

					$.next();
					$.reset(p);

					$.template_effect(() => {
						$.set_text(text, $.get(selectedKeys)[0]);
						$.set_text(text_1, $$props.table.name);
					});

					$.append($$anchor, p);
				};

				var alternate = ($$anchor) => {
					var p_1 = root();
					var b_2 = $.sibling($.child(p_1));
					var text_2 = $.only_child(b_2, true);
					var b_3 = $.sibling(b_2, 2);
					var text_3 = $.only_child(b_3, true);

					$.next();
					$.reset(p_1);

					$.template_effect(
						($0) => {
							$.set_text(text_2, $0);
							$.set_text(text_3, $$props.table.name);
						},
						[() => $.get(selectedKeys).join(', ')]
					);

					$.append($$anchor, p_1);
				};

				$.if(node, ($$render) => {
					if ($.get(selectedColumns).length === 1) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							direction: 'column',
							gap: 'xl',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();

								$.next(2);
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(requiresTwoWayConfirm)) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}