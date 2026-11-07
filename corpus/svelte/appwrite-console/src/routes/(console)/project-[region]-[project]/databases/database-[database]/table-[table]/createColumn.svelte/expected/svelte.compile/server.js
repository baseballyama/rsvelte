import * as $ from 'svelte/internal/server';
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

export default function CreateColumn($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			direction = null,
			column = null,
			columns = null,
			columnId = null,
			columnsOrder = null,
			selectedOption = 'Text',
			createMore = false,
			onColumnsReorder = null
		} = $$props;

		const tableId = page.params.table;
		const databaseId = page.params.database;
		let showSuggestionsAlert = true;
		let key = column?.key ?? null;

		let data = {
			required: column?.required ?? false,
			array: column?.array ?? false,
			default: column?.default ?? null,
			encrypt: column?.encrypt ?? false,
			...column
		};

		let availableOptions = $.derived(() => getSupportedColumns($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)));
		let ColumnComponent = $.derived(() => (availableOptions().find((option) => option.name === selectedOption) ?? availableOptions()[0]).component);

		function init() {
			key = null;
			$.store_set(option, null);
			data = { required: false, array: false, default: null, encrypt: false };

			/* default to text */
			selectedOption = 'Text';

			$.store_set(option, availableOptions()[0]);
		}

		function insertColumnInOrder() {
			if (!key) return;

			const currentOrder = (columnsOrder?.length ? columnsOrder : columns?.map((col) => col.id) || []).filter((columnId) => columnId !== '$id' && columnId !== INTERNAL_ACTIONS_COLUMN_ID);

			// if the length is empty,
			// means there's no ordering done.
			// auto handled, leave this here as is.
			if (!currentOrder.length) return;

			let newOrder;

			if (!direction || !direction.neighbour) {
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
					key,
					...currentOrder.slice(insertIndex)
				];
			} else {
				const neighbourIndex = currentOrder.indexOf(direction.neighbour);

				if (neighbourIndex === -1) {
					newOrder = [...currentOrder, key];
				} else {
					const insertIndex = direction.to === 'left' ? neighbourIndex : neighbourIndex + 1;

					newOrder = [
						...currentOrder.slice(0, insertIndex),
						key,
						...currentOrder.slice(insertIndex)
					];
				}
			}

			preferences.saveColumnOrder(page.data.organization.$id ?? page.data.project.teamId, tableId, newOrder);
			onColumnsReorder?.(newOrder);

			return newOrder;
		}

		async function submit() {
			try {
				await $.store_get($$store_subs ??= {}, '$option', option).create(databaseId, tableId, key, data);
				columnId = key;
				insertColumnInOrder();
				await invalidate(Dependencies.TABLE);

				addNotification({
					type: 'success',
					message: `Column ${key ?? data?.key} has been created`
				});

				trackEvent(Submit.ColumnCreate, { type: 'manual' });

				if (createMore) {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 'xl',
					children: ($$renderer) => {
						if (isCloud && showSuggestionsAlert) {
							$$renderer.push(`<!--[0--><div class="custom-inline-alert svelte-giax55">`);

							if (Alert.Inline) {
								$$renderer.push('<!--[-->');

								Alert.Inline($$renderer, {
									dismissible: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Need help? Let AI `);

										if (Link.Button) {
											$$renderer.push('<!--[-->');

											Link.Button($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->suggest columns`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` based on your data`);
									},

									$$slots: {
										default: true,
										icon: ($$renderer) => {
											{
												IconAINotification($$renderer, {});
											}
										}
									}
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'row',
								children: ($$renderer) => {
									InputText($$renderer, {
										id: 'key',
										label: 'Key',
										placeholder: 'Enter key',
										autofocus: true,
										disabled: selectedOption === 'Relationship',
										required: true,
										pattern: '^[A-Za-z0-9][A-Za-z0-9._\\-]*$',
										get value() {
											return key;
										},

										set value($$value) {
											key = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									InputSelect($$renderer, {
										id: 'type',
										label: 'Type',
										options: availableOptions().map((attr) => {
											return { label: attr.name, value: attr.name, leadingIcon: attr.icon };
										}),
										required: true,
										get value() {
											return selectedOption;
										},

										set value($$value) {
											selectedOption = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (selectedOption) {
							$$renderer.push('<!--[0-->');

							if (ColumnComponent()) {
								$$renderer.push('<!--[-->');

								ColumnComponent()($$renderer, {
									onclose: () => $.store_set(option, null),
									get data() {
										return data;
									},

									set data($$value) {
										data = $$value;
										$$settled = false;
									}
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, {
			columns,
			columnId,
			columnsOrder,
			selectedOption,
			createMore,
			submit
		});
	});
}