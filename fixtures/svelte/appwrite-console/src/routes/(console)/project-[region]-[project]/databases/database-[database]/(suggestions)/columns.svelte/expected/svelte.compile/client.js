import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';
import Input from './input.svelte';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { entityColumnSuggestions } from './store';

var root = $.from_html(`<!> <!>`, 1);

export default function Columns($$anchor, $$props) {
	$.push($$props, true);

	const $entityColumnSuggestions = () => $.store_get(entityColumnSuggestions, '$entityColumnSuggestions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let show = $.prop($$props, 'show', 15, false);
	const isOnRowsPage = $.derived(() => page.route?.id?.endsWith('table-[table]'));

	function resetSuggestionsStore() {
		show(false);
		$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).entity = null, $.untrack($entityColumnSuggestions));
		$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).context = null, $.untrack($entityColumnSuggestions));
		$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).force = false, $.untrack($entityColumnSuggestions));
		$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).enabled = false, $.untrack($entityColumnSuggestions));
		$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).thinking = false, $.untrack($entityColumnSuggestions));
	}

	async function triggerColumnSuggestions() {
		// set table info. first!
		$.store_mutate(
			entityColumnSuggestions,
			$.untrack($entityColumnSuggestions).entity = {
				id: page.params.table,
				name: page.data.table?.name ?? 'Table'
			},
			$.untrack($entityColumnSuggestions)
		);

		if (!$.get(isOnRowsPage)) {
			await goto(resolve('/(console)/project-[region]-[project]/databases/database-[database]/table-[table]', {
				region: page.params.region,
				project: page.params.project,
				database: page.params.database,
				table: page.params.table
			}));
		}

		$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).force = true, $.untrack($entityColumnSuggestions));
		$.store_mutate(entityColumnSuggestions, $.untrack($entityColumnSuggestions).enabled = true, $.untrack($entityColumnSuggestions));
		show(false);
	}

	Modal($$anchor, {
		title: 'Suggest columns',
		onSubmit: triggerColumnSuggestions,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			Input($$anchor, { isModal: true });
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node = $.first_child(fragment_2);

				Button(node, {
					text: true,
					$$events: { click: resetSuggestionsStore },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				Button(node_1, {
					submit: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Generate columns');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			}
		}
	});

	$.pop();
	$$cleanup();
}