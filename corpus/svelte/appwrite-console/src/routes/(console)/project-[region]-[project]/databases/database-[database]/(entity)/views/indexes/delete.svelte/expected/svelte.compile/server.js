import * as $ from 'svelte/internal/server';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { invalidate } from '$app/navigation';
import Confirm from '$lib/components/confirm.svelte';
import { getTerminologies } from '$database/(entity)';

export default function Delete($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { showDelete = false, selectedIndex = null, onDeleteIndexes } = $$props;
		let error = null;
		let selectedKeys = $.derived(() => getKeys(selectedIndex));
		const { dependencies } = getTerminologies();

		function getKeys(selected) {
			if (!selected) return [];

			return Array.isArray(selected) ? selected : [selected.key];
		}

		async function cleanup() {
			// capture keys before resetting!
			const keys = getKeys(selectedIndex);

			// reset selection!
			selectedIndex = Array.isArray(selectedIndex) ? [] : null;

			showDelete = false; // hide.

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
				await onDeleteIndexes(selectedKeys());
				await cleanup();
			} catch(e) {
				error = e.message;
				trackError(e, Submit.IndexDelete);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Confirm($$renderer, {
				confirmDeletion: true,
				title: 'Delete index',
				onSubmit: handleDelete,
				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				get open() {
					return showDelete;
				},

				set open($$value) {
					showDelete = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (selectedKeys().length === 1) {
						$$renderer.push(`<!--[0--><p>Are you sure you want to delete <b>${$.escape(selectedKeys()[0])}</b>?</p> <p>Deleting this index may slow down queries that depend on it. This action is
            irreversible.</p>`);
					} else {
						$$renderer.push(`<!--[-1--><p>Are you sure you want to delete <b>${$.escape(selectedKeys().join(', '))}</b>?</p> <p>Deleting these indexes may slow down queries that depend on it. This action is
            irreversible.</p>`);
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
		$.bind_props($$props, { showDelete, selectedIndex });
	});
}