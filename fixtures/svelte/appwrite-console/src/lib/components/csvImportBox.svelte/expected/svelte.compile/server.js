import * as $ from 'svelte/internal/server';
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

export default function CsvImportBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// re-render the key for sheet UI.
		/**
		 * Keeps a track of the active and ongoing csv migrations.
		 *
		 * The structure is as follows -
		 * `{ migrationId: { status: status, table: table } }`
		 */
		let importItems = new Map();

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
			const current = importItems.get(importData.$id);
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
				const next = new Map(importItems);

				next.delete(importData.$id);
				importItems = next;

				return;
			}

			const existing = importItems.get(importData.$id);
			const isDone = (s) => s === 'completed' || s === 'failed';
			const isInProgress = (s) => ['pending', 'processing', 'uploading'].includes(s);
			const shouldSkip = existing && isDone(existing.status) && isInProgress(status) || existing?.status === status;

			if (!shouldSkip) {
				const next = new Map(importItems);
				const errors = getErrors(importData);

				next.set(importData.$id, { status, table: tableName ?? undefined, errors });
				importItems = next;
			}

			if (status === 'completed' || status === 'failed') {
				await showCompletionNotification(databaseId, tableId, importData);
			}
		}

		function clear() {
			importItems = new Map();
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

		let isOpen = true;
		let showCsvImportBox = $.derived(() => importItems.size > 0);
		let showDetails = false;
		let selectedErrors = [];
		let parsedErrors = [];

		function openDetails(errors) {
			selectedErrors = errors ?? [];
			parsedErrors = selectedErrors.map(parseError);
			showDetails = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (showCsvImportBox()) {
				$$renderer.push('<!--[0-->');

				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						direction: 'column',
						gap: 'l',
						alignItems: 'flex-end',
						children: ($$renderer) => {
							$$renderer.push(`<section class="upload-box svelte-lmslu2"><header class="upload-box-header svelte-lmslu2"><h4 class="upload-box-title svelte-lmslu2">`);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									variant: 'm-500',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Importing rows (${$.escape(importItems.size)})`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</h4> <button${$.attr_class('upload-box-button svelte-lmslu2', void 0, { 'is-open': isOpen })} aria-label="toggle upload box"><span class="icon-cheveron-up" aria-hidden="true"></span></button> <button class="upload-box-button svelte-lmslu2" aria-label="close CSV import box"><span class="icon-x" aria-hidden="true"></span></button></header> <div class="upload-box-content-list svelte-lmslu2"><!--[-->`);

							const each_array = $.ensure_array_like([...importItems.entries()]);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let [key, value] = each_array[$$index];

								$$renderer.push(`<div${$.attr_class('upload-box-content svelte-lmslu2', void 0, { 'is-open': isOpen })}><ul class="upload-box-list"><li class="upload-box-item"><section class="progress-bar u-width-full-line"><div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">`);

								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`${$.html(text(value.status, value.table))}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div> <div${$.attr_class('progress-bar-container svelte-lmslu2', void 0, { 'is-danger': value.status === 'failed' })}${$.attr_style(`--graph-size:${$.stringify(graphSize(value.status))}%`)}></div> `);

								if (value.status === 'failed') {
									$$renderer.push('<!--[0-->');

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											gap: 'xs',
											alignItems: 'center',
											inline: true,
											children: ($$renderer) => {
												Icon($$renderer, {
													icon: IconExclamationCircle,
													color: '--fgcolor-error',
													size: 's'
												});

												$$renderer.push(`<!----> `);

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														color: '--fgcolor-error',
														children: ($$renderer) => {
															$$renderer.push(`<!---->There was an import issue. `);

															Link($$renderer, {
																style: 'color: inherit',
																onclick: () => openDetails(value.errors),
																children: ($$renderer) => {
																	$$renderer.push(`<!---->View details`);
																},
																$$slots: { default: true }
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

								$$renderer.push(`<!--]--></section></li></ul></div>`);
							}

							$$renderer.push(`<!--]--></div></section>`);
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

			$$renderer.push(`<!--]--> `);

			Modal($$renderer, {
				title: 'Import error',
				hideFooter: true,
				get show() {
					return showDetails;
				},

				set show($$value) {
					showDetails = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'm',
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										children: ($$renderer) => {
											Code($$renderer, {
												language: 'json',
												code: JSON.stringify(parsedErrors, null, 2),
												withCopy: true,
												allowScroll: true
											});
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

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

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