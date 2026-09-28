import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { Alert, Layout, Link } from '@appwrite.io/pink-svelte';
import { InputSelect, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { option, getSupportedColumns } from '$database/table-[table]/columns/store';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { preferences } from '$lib/stores/preferences';
import { onMount } from 'svelte';
import { showColumnsSuggestionsModal } from '$database/(suggestions)/store';
import IconAINotification from '$database/(suggestions)/icon/aiNotification.svelte';
import { showCreateColumnSheet, INTERNAL_ACTIONS_COLUMN_ID } from '$database/table-[table]/store';
import { isCloud } from '$lib/system';
import { slide } from 'svelte/transition';

var root = $.from_html(`Need help? Let AI <!> based on your data`, 1);
var root_1 = $.from_html(`<div class="custom-inline-alert svelte-giax55"><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function CreateColumn($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $option = () => $.store_get(option, '$option', $$stores);
	const $showCreateColumnSheet = () => $.store_get(showCreateColumnSheet, '$showCreateColumnSheet', $$stores);
	const $showColumnsSuggestionsModal = () => $.store_get(showColumnsSuggestionsModal, '$showColumnsSuggestionsModal', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let direction = $.prop($$props, 'direction', 3, null),
		column = $.prop($$props, 'column', 3, null),
		columns = $.prop($$props, 'columns', 11, null),
		columnId = $.prop($$props, 'columnId', 15, null),
		columnsOrder = $.prop($$props, 'columnsOrder', 11, null),
		selectedOption = $.prop($$props, 'selectedOption', 15, 'Text'),
		createMore = $.prop($$props, 'createMore', 11, false),
		onColumnsReorder = $.prop($$props, 'onColumnsReorder', 3, null);

	const tableId = page.params.table;
	const databaseId = page.params.database;
	let showSuggestionsAlert = $.state(true);
	let key = $.state($.proxy(column()?.key ?? null));

	let data = $.state($.proxy({
		required: column()?.required ?? false,
		array: column()?.array ?? false,
		default: column()?.default ?? null,
		encrypt: column()?.encrypt ?? false,
		...column()
	}));

	let availableOptions = $.derived(() => getSupportedColumns($regionalConsoleVariables()));
	let ColumnComponent = $.derived(() => ($.get(availableOptions).find((option) => option.name === selectedOption()) ?? $.get(availableOptions)[0]).component);

	function init() {
		$.set(key, null);
		$.store_set(option, null);
		$.set(data, { required: false, array: false, default: null, encrypt: false }, true);

		/* default to text */
		selectedOption('Text');

		$.store_set(option, $.get(availableOptions)[0]);
	}

	function insertColumnInOrder() {
		if (!$.get(key)) return;

		const currentOrder = (columnsOrder()?.length
			? columnsOrder()
			: columns()?.map((col) => col.id) || []).filter((columnId) => columnId !== '$id' && columnId !== INTERNAL_ACTIONS_COLUMN_ID);

		// if the length is empty,
		// means there's no ordering done.
		// auto handled, leave this here as is.
		if (!currentOrder.length) return;

		let newOrder;

		if (!direction() || !direction().neighbour) {
			const lastTwo = currentOrder.slice(-2);
			const hasTimestampColumnsAtEnd = lastTwo.length === 2 && lastTwo.includes('$createdAt') && lastTwo.includes('$updatedAt');
			let insertIndex;

			if (hasTimestampColumnsAtEnd) {
				insertIndex = Math.min(currentOrder.indexOf('$createdAt'), currentOrder.indexOf('$updatedAt'));
			} else {
				insertIndex = currentOrder.length;
			}

			newOrder = [
				...currentOrder.slice(0, insertIndex),
				$.get(key),
				...currentOrder.slice(insertIndex)
			];
		} else {
			const neighbourIndex = currentOrder.indexOf(direction().neighbour);

			if (neighbourIndex === -1) {
				newOrder = [...currentOrder, $.get(key)];
			} else {
				const insertIndex = direction().to === 'left' ? neighbourIndex : neighbourIndex + 1;

				newOrder = [
					...currentOrder.slice(0, insertIndex),
					$.get(key),
					...currentOrder.slice(insertIndex)
				];
			}
		}

		preferences.saveColumnOrder(page.data.organization.$id ?? page.data.project.teamId, tableId, newOrder);
		onColumnsReorder()?.(newOrder);

		return newOrder;
	}

	async function submit() {
		try {
			await $option().create(databaseId, tableId, $.get(key), $.get(data));
			columnId($.get(key));
			insertColumnInOrder();
			await invalidate(Dependencies.TABLE);

			addNotification({
				type: 'success',
				message: `Column ${$.get(key) ?? $.get(data)?.key} has been created`
			});

			trackEvent(Submit.ColumnCreate, { type: 'manual' });

			if (createMore()) {
				init();

				return true; // keep sheet open
			}

			return false; // close sheet
		} catch(e) {
			addNotification({ type: 'error', message: e.message });
			trackError(e, Submit.ColumnCreate);

			return true; // keep open on error
		}
	}

	onMount(init);

	$.user_effect(() => {
		columnId(); /* silences lint check, variable not read */

		// correct view
		if (selectedOption()) {
			const resolved = $.get(availableOptions).find((option) => option.name === selectedOption()) ?? $.get(availableOptions)[0];

			$.store_set(option, resolved);

			if (resolved && resolved.name !== selectedOption()) {
				selectedOption(resolved.name);
			}
		}
	});

	var $$exports = { submit };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'xl',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var div = root_1();
						var node_2 = $.child(div);

						$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
							Alert_Inline($$anchor, {
								dismissible: true,
								$$events: { dismiss: () => $.set(showSuggestionsAlert, false) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_2 = root();
									var node_3 = $.sibling($.first_child(fragment_2));

									$.component(node_3, () => Link.Button, ($$anchor, Link_Button) => {
										Link_Button($$anchor, {
											$$events: {
												click: () => {
													$.store_mutate(showCreateColumnSheet, $.untrack($showCreateColumnSheet).show = false, $.untrack($showCreateColumnSheet));
													$.store_set(showColumnsSuggestionsModal, true);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('suggest columns');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.next();
									$.append($$anchor, fragment_2);
								},

								$$slots: {
									default: true,
									icon: ($$anchor, $$slotProps) => {
										IconAINotification($$anchor, {});
									}
								}
							});
						});

						$.reset(div);
						$.transition(3, div, () => slide);
						$.append($$anchor, div);
					};

					$.if(node_1, ($$render) => {
						if (isCloud && $.get(showSuggestionsAlert)) $$render(consequent);
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						direction: 'row',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var node_5 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => selectedOption() === 'Relationship');

								InputText(node_5, {
									id: 'key',
									label: 'Key',
									placeholder: 'Enter key',
									autofocus: true,
									get disabled() {
										return $.get($0);
									},
									required: true,
									pattern: '^[A-Za-z0-9][A-Za-z0-9._\\-]*$',
									get value() {
										return $.get(key);
									},

									set value($$value) {
										$.set(key, $$value, true);
									}
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => $.get(availableOptions).map((attr) => {
									return { label: attr.name, value: attr.name, leadingIcon: attr.icon };
								}));

								InputSelect(node_6, {
									id: 'type',
									label: 'Type',
									get options() {
										return $.get($0);
									},
									required: true,
									get value() {
										return selectedOption();
									},

									set value($$value) {
										selectedOption($$value);
									}
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_4, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => $.get(ColumnComponent), ($$anchor, ColumnComponent_1) => {
							ColumnComponent_1($$anchor, {
								onclose: () => $.store_set(option, null),
								get data() {
									return $.get(data);
								},

								set data($$value) {
									$.set(data, $$value, true);
								}
							});
						});

						$.append($$anchor, fragment_5);
					};

					$.if(node_7, ($$render) => {
						if (selectedOption()) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}