import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { realtime, sdk } from '$lib/stores/sdk';
import { getProjectId } from '$lib/helpers/project';
import { addNotification } from '$lib/stores/notifications';
import { Layout, Typography, Code } from '@appwrite.io/pink-svelte';
import { Modal } from '$lib/components';
import { Query } from '@appwrite.io/console';

export default function CsvExportBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let exportItems = new Map();

		function downloadExportedFile(downloadUrl) {
			if (!downloadUrl) {
				return;
			}

			window.open(downloadUrl, '_blank');
		}

		async function showErrorNotification(payload) {
			let errorMessage = 'Export failed. Please try again.';

			try {
				const parsed = JSON.parse(payload.errors[0]);

				errorMessage = parsed?.message || errorMessage;
			} catch {
				errorMessage = payload.errors[0] || errorMessage;
			}

			addNotification({
				type: 'error',
				message: errorMessage,
				isHtml: true,
				timeout: 10000
			});
		}

		async function updateOrAddItem(exportData) {
			if (exportData.destination?.toLowerCase() !== 'csv') return;

			const status = exportData.status;
			const current = exportItems.get(exportData.$id);
			let tableName = current?.table;

			// Get bucket, filename, and download URL from migration options
			const options = ('options' in exportData ? exportData.options : {}) || {};

			const bucketId = options.bucketId || '';
			const fileName = options.filename || '';
			const downloadUrl = options.downloadUrl || '';
			let bucketName = current?.bucketName;
			const existing = exportItems.get(exportData.$id);
			const isDone = (s) => ['completed', 'failed'].includes(s);
			const isInProgress = (s) => ['pending', 'processing'].includes(s);

			// Skip if we're trying to set an in-progress status on a completed migration
			const shouldSkip = existing && isDone(existing.status) && isInProgress(status);

			const hasNewData = downloadUrl && (!existing?.downloadUrl || existing.downloadUrl !== downloadUrl);
			const shouldSkipDuplicate = existing?.status === status && !hasNewData;

			if (shouldSkip || shouldSkipDuplicate) return;

			exportItems.set(exportData.$id, {
				status,
				table: tableName ?? current?.table,
				bucketId,
				bucketName,
				fileName,
				downloadUrl,
				errors: exportData.errors || []
			});

			exportItems = new Map(exportItems);

			switch (status) {
				case 'completed':
					if (downloadUrl) {
						downloadExportedFile(downloadUrl);

						addNotification({
							type: 'success',
							message: `Export completed`,
							timeout: 10000,
							buttons: [
								{
									name: 'Download',
									method: () => downloadExportedFile(downloadUrl)
								}
							]
						});
					}
					break;

				case 'failed':
					await showErrorNotification(exportData);
					break;
			}
		}

		function clear() {
			exportItems = new Map();
		}

		function graphSize(status) {
			switch (status) {
				case 'pending':
					return 10;

				case 'processing':
					return 60;

				case 'completed':

				case 'failed':
					return 100;

				default:
					return 30;
			}
		}

		function text(status, tableName = '') {
			const table = tableName ? `<b>${tableName}</b>` : '';

			switch (status) {
				case 'completed':
					return `Exporting ${table} completed`;

				case 'failed':
					return `Exporting ${table} failed`;

				case 'processing':
					return `Exporting ${table}`;

				default:
					return 'Preparing export...';
			}
		}

		onMount(() => {
			sdk.forProject(page.params.region, page.params.project).migrations.list({
				queries: [
					Query.equal('destination', 'CSV'),
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
		let showCsvExportBox = $.derived(() => exportItems.size > 0);
		let showErrorModal = false;
		let selectedErrors = [];
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (showCsvExportBox()) {
				$$renderer.push('<!--[0-->');

				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						direction: 'column',
						gap: 'l',
						alignItems: 'flex-end',
						children: ($$renderer) => {
							$$renderer.push(`<section class="upload-box svelte-gu82dd"><header class="upload-box-header svelte-gu82dd"><h4 class="upload-box-title svelte-gu82dd">`);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									variant: 'm-500',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Exporting rows (${$.escape(exportItems.size)})`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</h4> <button${$.attr_class('upload-box-button svelte-gu82dd', void 0, { 'is-open': isOpen })} aria-label="toggle upload box"><span class="icon-cheveron-up" aria-hidden="true"></span></button> <button class="upload-box-button svelte-gu82dd" aria-label="close export box"><span class="icon-x" aria-hidden="true"></span></button></header> <div class="upload-box-content-list svelte-gu82dd"><!--[-->`);

							const each_array = $.ensure_array_like([...exportItems.entries()]);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let [key, value] = each_array[$$index];

								$$renderer.push(`<div${$.attr_class('upload-box-content svelte-gu82dd', void 0, { 'is-open': isOpen })}><ul class="upload-box-list"><li class="upload-box-item"><section class="progress-bar u-width-full-line"><div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">`);

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

								$$renderer.push(` `);

								if (value.status === 'failed' && value.errors && value.errors.length > 0) {
									$$renderer.push(`<!--[0--><button class="link" type="button">more details</button>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div> <div${$.attr_class('progress-bar-container svelte-gu82dd', void 0, { 'is-danger': value.status === 'failed' })}${$.attr_style(`--graph-size:${$.stringify(graphSize(value.status))}%`)}></div></section></li></ul></div>`);
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
				title: 'Export error details',
				hideFooter: true,
				get show() {
					return showErrorModal;
				},

				set show($$value) {
					showErrorModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (selectedErrors.length > 0) {
						$$renderer.push('<!--[0-->');

						Code($$renderer, {
							code: JSON.stringify(
								selectedErrors.map((err) => {
									try {
										return JSON.parse(err);
									} catch {
										return err;
									}
								}),
								null,
								2
							),
							lang: 'json',
							hideHeader: true
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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