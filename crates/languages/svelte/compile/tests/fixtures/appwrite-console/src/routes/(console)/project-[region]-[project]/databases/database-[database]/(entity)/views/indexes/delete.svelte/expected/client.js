import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { invalidate } from '$app/navigation';
import Confirm from '$lib/components/confirm.svelte';
import { getTerminologies } from '$database/(entity)';

var root = $.from_html(
	`<p>Are you sure you want to delete <b> </b>?</p> <p>Deleting this index may slow down queries that depend on it. This action is
            irreversible.</p>`,
	1
);

var root_1 = $.from_html(
	`<p>Are you sure you want to delete <b> </b>?</p> <p>Deleting these indexes may slow down queries that depend on it. This action is
            irreversible.</p>`,
	1
);

export default function Delete($$anchor, $$props) {
	$.push($$props, true);

	let showDelete = $.prop($$props, 'showDelete', 15, false),
		selectedIndex = $.prop($$props, 'selectedIndex', 15, null);

	let error = $.state(null);
	let selectedKeys = $.derived(() => getKeys(selectedIndex()));
	const { dependencies } = getTerminologies();

	function getKeys(selected) {
		if (!selected) return [];

		return Array.isArray(selected) ? selected : [selected.key];
	}

	async function cleanup() {
		// capture keys before resetting!
		const keys = getKeys(selectedIndex());

		// reset selection!
		selectedIndex(Array.isArray(selectedIndex()) ? [] : null);

		showDelete(false // hide.
		);

		// events and notif!
		trackEvent(Submit.IndexDelete);

		addNotification({
			type: 'success',
			message: keys.length === 1
				? 'Index has been deleted'
				: `${keys.length} indexes have been deleted`
		});

		// invalidate proper dependency.
		await invalidate(dependencies.entity.singular);
	}

	async function handleDelete() {
		try {
			await $$props.onDeleteIndexes($.get(selectedKeys));
			await cleanup();
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.IndexDelete);
		}
	}

	Confirm($$anchor, {
		confirmDeletion: true,
		title: 'Delete index',
		onSubmit: handleDelete,
		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		get open() {
			return showDelete();
		},

		set open($$value) {
			showDelete($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var p = $.first_child(fragment_2);
					var b = $.sibling($.child(p));
					var text = $.only_child(b, true);

					$.next();
					$.reset(p);
					$.next(2);
					$.template_effect(() => $.set_text(text, $.get(selectedKeys)[0]));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = root_1();
					var p_1 = $.first_child(fragment_3);
					var b_1 = $.sibling($.child(p_1));
					var text_1 = $.only_child(b_1, true);

					$.next();
					$.reset(p_1);
					$.next(2);
					$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(selectedKeys).join(', ')]);
					$.append($$anchor, fragment_3);
				};

				$.if(node, ($$render) => {
					if ($.get(selectedKeys).length === 1) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}