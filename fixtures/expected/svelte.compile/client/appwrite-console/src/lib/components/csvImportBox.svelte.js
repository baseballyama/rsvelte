import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Dependencies } from '$lib/constants';
import { realtime, sdk } from '$lib/stores/sdk';
import { goto, invalidate } from '$app/navigation';
import { getProjectId } from '$lib/helpers/project';
import { addNotification } from '$lib/stores/notifications';
import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
import { IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';
import { Modal, Code } from '$lib/components';
import { Query } from '@appwrite.io/console';
import { hash } from '$lib/helpers/string';
import { spreadsheetRenderKey } from '$database/store';
import { Link } from '$lib/elements';

var root = $.from_html(`There was an import issue. <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><ul class="upload-box-list"><li class="upload-box-item"><section class="progress-bar u-width-full-line"><div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between"><!></div> <div></div> <!></section></li></ul></div>`);
var root_3 = $.from_html(`<section class="upload-box svelte-lmslu2"><header class="upload-box-header svelte-lmslu2"><h4 class="upload-box-title svelte-lmslu2"><!></h4> <button aria-label="toggle upload box"><span class="icon-cheveron-up" aria-hidden="true"></span></button> <button class="upload-box-button svelte-lmslu2" aria-label="close CSV import box"><span class="icon-x" aria-hidden="true"></span></button></header> <div class="upload-box-content-list svelte-lmslu2"></div></section>`);

export default function CsvImportBox($$anchor, $$props) {
	$.push($$props, true);

	// re-render the key for sheet UI.
	/**
	 * Keeps a track of the active and ongoing csv migrations.
	 *
	 * The structure is as follows -
	 * `{ migrationId: { status: status, table: table } }`
	 */
	let importItems = $.state($.proxy(new Map()));

	async function showCompletionNotification(database, table, payload) {
		const isSuccess = payload.status === 'completed';
		const isError = !isSuccess && !!payload.errors;

		if (!isSuccess && !isError) return;

		let errorMessage = 'Import failed. Check your CSV for correct fields and required values.';
		const errors = getErrors(payload);

		if (errors) {
			errorMessage = extractErrorMessage(errors);
		}

		const type = isSuccess ? 'success' : 'error';
		const message = isError ? errorMessage : 'CSV import finished successfully.';
		const url = `${base}/project-${page.params.region}-${page.params.project}/databases/database-${database}/table-${table}`;

		addNotification({
			type,
			message,
			isHtml: true,
			buttons: isSuccess && table !== page.params.table
				? [{ name: 'View rows', method: () => goto(url) }]
				: undefined
		});

		if (isSuccess) {
			await invalidate(Dependencies.ROWS);
			spreadsheetRenderKey.set(hash(Date.now().toString()));
		}
	}

	async function updateOrAddItem(importData) {
		if (importData.source.toLowerCase() !== 'csv') return;

		const status = importData.status;
		const databaseId = importData.parentResourceId ?? '';
		const tableId = importData.resourceId ?? '';
		const current = $.get(importItems).get(importData.$id);
		let tableName = current?.table ?? null;

		if (!tableName && tableId) {
			try {
				const table = await sdk.forProject(page.params.region, page.params.project).tablesDB.getTable({ databaseId, tableId });

				tableName = table.name;
			} catch {
				tableName = null;
			}
		}

		if (tableId && tableName === null) {
			const next = new Map($.get(importItems));

			next.delete(importData.$id);
			$.set(importItems, next, true);

			return;
		}

		const existing = $.get(importItems).get(importData.$id);
		const isDone = (s) => s === 'completed' || s === 'failed';
		const isInProgress = (s) => ['pending', 'processing', 'uploading'].includes(s);
		const shouldSkip = existing && isDone(existing.status) && isInProgress(status) || existing?.status === status;

		if (!shouldSkip) {
			const next = new Map($.get(importItems));
			const errors = getErrors(importData);

			next.set(importData.$id, { status, table: tableName ?? undefined, errors });
			$.set(importItems, next, true);
		}

		if (status === 'completed' || status === 'failed') {
			await showCompletionNotification(databaseId, tableId, importData);
		}
	}

	function clear() {
		$.set(importItems, new Map(), true);
	}

	function getErrors(importData) {
		return Array.isArray(importData.errors) ? importData.errors : undefined;
	}

	function parseError(error) {
		try {
			return JSON.parse(error);
		} catch {
			return error;
		}
	}

	function extractErrorMessage(errors) {
		try {
			return JSON.parse(errors[0]).message;
		} catch {
			return 'Import failed. Check your CSV for correct fields and required values.';
		}
	}

	function graphSize(status) {
		switch (status) {
			case 'pending':
				return 10;

			case 'processing':
				return 30;

			case 'uploading':
				return 60;

			case 'completed':

			case 'failed':
				return 100;

			default:
				return 30;
		}
	}

	function text(status, collectionName = '') {
		const name = collectionName ? `<b>${collectionName}</b>` : '';

		switch (status) {
			case 'completed':
				return `CSV import completed${name ? ` to ${name}` : ''}`;

			case 'failed':
				return `CSV import failed${name ? ` to ${name}` : ''}`;

			case 'processing':
				return `Importing CSV file${name ? ` to ${name}` : ''}`;

			default:
				return 'Preparing CSV for import...';
		}
	}

	onMount(() => {
		sdk.forProject(page.params.region, page.params.project).migrations.list({
			queries: [
				Query.equal('source', 'CSV'),
				Query.equal('status', ['pending', 'processing'])
			]
		}).then((migrations) => {
			migrations.migrations.forEach(updateOrAddItem);
		});

		return realtime.forConsole(page.params.region, 'console', (response) => {
			if (!response.channels.includes(`projects.${getProjectId()}`)) return;

			if (response.events.includes('migrations.*')) {
				updateOrAddItem(response.payload);
			}
		});
	});

	let isOpen = $.state(true);
	let showCsvImportBox = $.derived(() => $.get(importItems).size > 0);
	let showDetails = $.state(false);
	let selectedErrors = $.state($.proxy([]));
	let parsedErrors = $.state($.proxy([]));

	function openDetails(errors) {
		$.set(selectedErrors, errors ?? [], true);
		$.set(parsedErrors, $.get(selectedErrors).map(parseError), true);
		$.set(showDetails, true);
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'column',
					gap: 'l',
					alignItems: 'flex-end',
					children: ($$anchor, $$slotProps) => {
						var section = root_3();
						var header = $.child(section);
						var h4 = $.child(header);
						var node_2 = $.child(h4);

						$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
							Typography_Text($$anchor, {
								variant: 'm-500',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, `Importing rows (${$.get(importItems).size ?? ''})`));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.reset(h4);

						var button = $.sibling(h4, 2);
						let classes;
						var button_1 = $.sibling(button, 2);

						$.reset(header);

						var div = $.sibling(header, 2);

						$.each(div, 21, () => [...$.get(importItems).entries()], ([key, value]) => key, ($$anchor, $$item) => {
							var $$array = $.derived(() => $.to_array($.get($$item), 2));
							let key = () => $.get($$array)[0];
							let value = () => $.get($$array)[1];
							var div_1 = root_2();
							let classes_1;
							var ul = $.child(div_1);
							var li = $.child(ul);
							var section_1 = $.child(li);
							var div_2 = $.child(section_1);
							var node_3 = $.child(div_2);

							$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text_1) => {
								Typography_Text_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.html(node_4, () => text(value().status, value().table));
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							let classes_2;
							var node_5 = $.sibling(div_3, 2);

							{
								var consequent = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											direction: 'row',
											gap: 'xs',
											alignItems: 'center',
											inline: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_7 = $.first_child(fragment_5);

												Icon(node_7, {
													get icon() {
														return IconExclamationCircle;
													},
													color: '--fgcolor-error',
													size: 's'
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text_2) => {
													Typography_Text_2($$anchor, {
														color: '--fgcolor-error',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_6 = root();
															var node_9 = $.sibling($.first_child(fragment_6));

															Link(node_9, {
																style: 'color: inherit',
																onclick: () => openDetails(value().errors),
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('View details');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								};

								$.if(node_5, ($$render) => {
									if (value().status === 'failed') $$render(consequent);
								});
							}

							$.reset(section_1);
							$.reset(li);
							$.reset(ul);
							$.reset(div_1);

							$.template_effect(
								($0) => {
									classes_1 = $.set_class(div_1, 1, 'upload-box-content svelte-lmslu2', null, classes_1, { 'is-open': $.get(isOpen) });
									classes_2 = $.set_class(div_3, 1, 'progress-bar-container svelte-lmslu2', null, classes_2, { 'is-danger': value().status === 'failed' });
									$.set_style(div_3, `--graph-size:${$0 ?? ''}%`);
								},
								[() => graphSize(value().status)]
							);

							$.append($$anchor, div_1);
						});

						$.reset(div);
						$.reset(section);
						$.template_effect(() => classes = $.set_class(button, 1, 'upload-box-button svelte-lmslu2', null, classes, { 'is-open': $.get(isOpen) }));
						$.delegated('click', button, () => $.set(isOpen, !$.get(isOpen)));
						$.delegated('click', button_1, clear);
						$.append($$anchor, section);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(showCsvImportBox)) $$render(consequent_1);
		});
	}

	var node_10 = $.sibling(node, 2);

	Modal(node_10, {
		title: 'Import error',
		hideFooter: true,
		get show() {
			return $.get(showDetails);
		},

		set show($$value) {
			$.set(showDetails, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_7 = $.comment();
			var node_11 = $.first_child(fragment_7);

			$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
				Layout_Stack_2($$anchor, {
					gap: 'm',
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = $.comment();
						var node_12 = $.first_child(fragment_8);

						$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
							Layout_Stack_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => JSON.stringify($.get(parsedErrors), null, 2));

										Code($$anchor, {
											language: 'json',
											get code() {
												return $.get($0);
											},
											withCopy: true,
											allowScroll: true
										});
									}
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);