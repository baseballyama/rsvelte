import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { realtime, sdk } from '$lib/stores/sdk';
import { getProjectId } from '$lib/helpers/project';
import { addNotification } from '$lib/stores/notifications';
import { Layout, Typography, Code } from '@appwrite.io/pink-svelte';
import { Modal } from '$lib/components';
import { Query } from '@appwrite.io/console';

var root = $.from_html(`<button class="link" type="button">more details</button>`);
var root_1 = $.from_html(`<div><ul class="upload-box-list"><li class="upload-box-item"><section class="progress-bar u-width-full-line"><div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between"><!> <!></div> <div></div></section></li></ul></div>`);
var root_2 = $.from_html(`<section class="upload-box svelte-gu82dd"><header class="upload-box-header svelte-gu82dd"><h4 class="upload-box-title svelte-gu82dd"><!></h4> <button aria-label="toggle upload box"><span class="icon-cheveron-up" aria-hidden="true"></span></button> <button class="upload-box-button svelte-gu82dd" aria-label="close export box"><span class="icon-x" aria-hidden="true"></span></button></header> <div class="upload-box-content-list svelte-gu82dd"></div></section>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function CsvExportBox($$anchor, $$props) {
	$.push($$props, true);

	let exportItems = $.state($.proxy(new Map()));

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
		const current = $.get(exportItems).get(exportData.$id);
		let tableName = current?.table;

		// Get bucket, filename, and download URL from migration options
		const options = ('options' in exportData ? exportData.options : {}) || {};

		const bucketId = options.bucketId || '';
		const fileName = options.filename || '';
		const downloadUrl = options.downloadUrl || '';
		let bucketName = current?.bucketName;
		const existing = $.get(exportItems).get(exportData.$id);
		const isDone = (s) => ['completed', 'failed'].includes(s);
		const isInProgress = (s) => ['pending', 'processing'].includes(s);

		// Skip if we're trying to set an in-progress status on a completed migration
		const shouldSkip = existing && isDone(existing.status) && isInProgress(status);

		const hasNewData = downloadUrl && (!existing?.downloadUrl || existing.downloadUrl !== downloadUrl);
		const shouldSkipDuplicate = existing?.status === status && !hasNewData;

		if (shouldSkip || shouldSkipDuplicate) return;

		$.get(exportItems).set(exportData.$id, {
			status,
			table: tableName ?? current?.table,
			bucketId,
			bucketName,
			fileName,
			downloadUrl,
			errors: exportData.errors || []
		});

		$.set(exportItems, new Map($.get(exportItems)), true);

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
		$.set(exportItems, new Map(), true);
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

	let isOpen = $.state(true);
	let showCsvExportBox = $.derived(() => $.get(exportItems).size > 0);
	let showErrorModal = $.state(false);
	let selectedErrors = $.state($.proxy([]));
	var fragment = root_3();
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
						var section = root_2();
						var header = $.child(section);
						var h4 = $.child(header);
						var node_2 = $.child(h4);

						$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
							Typography_Text($$anchor, {
								variant: 'm-500',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, `Exporting rows (${$.get(exportItems).size ?? ''})`));
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

						$.each(div, 21, () => [...$.get(exportItems).entries()], ([key, value]) => key, ($$anchor, $$item) => {
							var $$array = $.derived(() => $.to_array($.get($$item), 2));
							let key = () => $.get($$array)[0];
							let value = () => $.get($$array)[1];
							var div_1 = root_1();
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

							var node_5 = $.sibling(node_3, 2);

							{
								var consequent = ($$anchor) => {
									var button_2 = root();

									$.delegated('click', button_2, () => {
										$.set(selectedErrors, value().errors, true);
										$.set(showErrorModal, true);
									});

									$.append($$anchor, button_2);
								};

								$.if(node_5, ($$render) => {
									if (value().status === 'failed' && value().errors && value().errors.length > 0) $$render(consequent);
								});
							}

							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							let classes_2;

							$.reset(section_1);
							$.reset(li);
							$.reset(ul);
							$.reset(div_1);

							$.template_effect(
								($0) => {
									classes_1 = $.set_class(div_1, 1, 'upload-box-content svelte-gu82dd', null, classes_1, { 'is-open': $.get(isOpen) });
									classes_2 = $.set_class(div_3, 1, 'progress-bar-container svelte-gu82dd', null, classes_2, { 'is-danger': value().status === 'failed' });
									$.set_style(div_3, `--graph-size:${$0 ?? ''}%`);
								},
								[() => graphSize(value().status)]
							);

							$.append($$anchor, div_1);
						});

						$.reset(div);
						$.reset(section);
						$.template_effect(() => classes = $.set_class(button, 1, 'upload-box-button svelte-gu82dd', null, classes, { 'is-open': $.get(isOpen) }));
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
			if ($.get(showCsvExportBox)) $$render(consequent_1);
		});
	}

	var node_6 = $.sibling(node, 2);

	Modal(node_6, {
		title: 'Export error details',
		hideFooter: true,
		get show() {
			return $.get(showErrorModal);
		},

		set show($$value) {
			$.set(showErrorModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_7 = $.first_child(fragment_4);

			{
				var consequent_2 = ($$anchor) => {
					{
						let $0 = $.derived(() => JSON.stringify(
							$.get(selectedErrors).map((err) => {
								try {
									return JSON.parse(err);
								} catch {
									return err;
								}
							}),
							null,
							2
						));

						Code($$anchor, {
							get code() {
								return $.get($0);
							},
							lang: 'json',
							hideHeader: true
						});
					}
				};

				$.if(node_7, ($$render) => {
					if ($.get(selectedErrors).length > 0) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);