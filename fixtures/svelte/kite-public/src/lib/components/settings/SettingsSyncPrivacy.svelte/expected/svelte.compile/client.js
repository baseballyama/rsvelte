import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconArrowLeft, IconDownload, IconLoader2, IconTrash } from '@tabler/icons-svelte';
import { getContext } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import { syncManager } from '$lib/client/sync-manager';
import { safeGetItem, safeSetItem } from '$lib/client/utils/safe-storage';

var root = $.from_html(`<div class="flex items-center justify-center py-8"><div class="flex flex-col items-center gap-3"><svg class="animate-spin h-8 w-8 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <p class="text-sm text-gray-600 dark:text-gray-400"> </p></div></div>`);
var root_1 = $.from_html(`<div class="space-y-3"><p class="text-sm font-medium text-gray-900 dark:text-gray-100"> </p> <p class="text-sm text-gray-700 dark:text-gray-300"> </p> <p class="text-xs text-red-600 dark:text-red-400"> </p> <div class="flex gap-2"><button class="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"> </button> <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"><!> </button></div></div>`);
var root_2 = $.from_html(`<div class="space-y-3"><div class="flex items-center gap-2 text-green-600 dark:text-green-400"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> <p class="text-sm"> </p></div> <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"><!> </button></div>`);
var root_3 = $.from_html(`<div class="space-y-3"><div class="flex items-start gap-2"><svg class="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg> <p class="text-sm text-red-600 dark:text-red-400"> </p></div> <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"><!> </button></div>`);
var root_4 = $.from_html(`<!> `, 1);
var root_5 = $.from_html(`<div class="mt-3 text-sm text-red-600 dark:text-red-400"> </div>`);
var root_6 = $.from_html(`<p class="mb-4 text-sm text-gray-600 dark:text-gray-400"> </p> <div class="flex gap-2"><button type="button" class="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><!></button> <button type="button" class="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"><!> </button></div> <!>`, 1);
var root_7 = $.from_html(`<div><h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100"> </h3> <div class="space-y-4"><div><label class="flex items-center justify-between"><div class="flex-1"><div class="flex items-center gap-2"><span id="label-sync-settings" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </span> <!></div> <div class="text-xs text-gray-500 dark:text-gray-400"> </div></div> <button type="button" role="switch" aria-labelledby="label-sync-settings"><span></span></button></label></div> <div><label class="flex items-center justify-between"><div class="flex-1"><div class="flex items-center gap-2"><span id="label-sync-history" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </span> <!></div> <div class="text-xs text-gray-500 dark:text-gray-400"> </div></div> <button type="button" role="switch" aria-labelledby="label-sync-history"><span></span></button></label></div></div> <div class="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800"><p class="text-sm text-blue-800 dark:text-blue-300"><strong> </strong> </p></div></div> <div class="border-t pt-6 dark:border-gray-700"><h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100"> </h3> <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50"><!></div></div>`, 1);
var root_8 = $.from_html(`<div class="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-900/50"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100"> </h3> <p class="mt-1 text-sm text-gray-500 dark:text-gray-400"> </p> <div class="mt-4"><a href="https://kagi.com/signin" class="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"> </a></div></div>`);
var root_9 = $.from_html(`<div class="space-y-6"><div class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line"> </div> <!></div>`);

export default function SettingsSyncPrivacy($$anchor, $$props) {
	$.push($$props, true);

	// Get session from context
	const session = getContext('session');

	// Sync toggle states
	let syncSettings = $.state(safeGetItem('syncSettings') !== 'false');

	let syncReadHistory = $.state(safeGetItem('syncReadHistory') !== 'false');
	let isSyncingSettings = $.state(false);
	let isSyncingHistory = $.state(false);

	// Clear data states
	let isClearing = $.state(false);

	let clearSuccess = $.state(false);
	let clearError = $.state(null);
	let showClearConfirm = $.state(false);

	// Export data states
	let isExporting = $.state(false);

	let exportError = $.state(null);

	// Toggle sync settings
	async function toggleSyncSettings() {
		$.set(syncSettings, !$.get(syncSettings));
		safeSetItem('syncSettings', $.get(syncSettings).toString());

		if ($.get(syncSettings) && session?.loggedIn && session?.id) {
			// If turning on, force push ALL local settings to server
			$.set(isSyncingSettings, true);

			try {
				// Force push all local settings (forceAllSettings=true, forceSync=true)
				await syncManager.sync(true, true);
			} finally {
				$.set(isSyncingSettings, false);
			}
		}
	}

	// Toggle read history sync
	async function toggleSyncReadHistory() {
		const wasEnabled = $.get(syncReadHistory);

		$.set(syncReadHistory, !$.get(syncReadHistory));
		safeSetItem('syncReadHistory', $.get(syncReadHistory).toString());

		if ($.get(syncReadHistory) && !wasEnabled && session?.loggedIn && session?.id) {
			// If turning ON, sync both local and remote data
			$.set(isSyncingHistory, true);

			try {
				await syncManager.onReadHistorySyncEnabled();
			} finally {
				$.set(isSyncingHistory, false);
			}
		}

		// When turning OFF, don't reset sequence - just pause syncing
	}

	// Clear all synced data
	async function clearAllData() {
		if (!session?.loggedIn || !session?.id) {
			$.set(clearError, s('settings.sync.clear.errorNotLoggedIn') || 'You must be logged in to clear synced data', true);
			$.set(showClearConfirm, false);

			return;
		}

		$.set(showClearConfirm, false);
		$.set(isClearing, true);
		$.set(clearError, null);
		$.set(clearSuccess, false);

		try {
			const response = await fetch('/api/sync/clear', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				throw new Error((s('settings.sync.clear.errorFailed') || 'Failed to clear data') + `: ${response.statusText}`);
			}

			$.set(clearSuccess, true);

			// Reset sync states
			$.set(syncSettings, false);

			$.set(syncReadHistory, false);
			safeSetItem('syncSettings', 'false');
			safeSetItem('syncReadHistory', 'false');

			// Clear local sync metadata
			if (session?.id) {
				localStorage.removeItem(`lastSync_${session.id}`);
				localStorage.removeItem(`lastReadHistorySequence_${session.id}_${syncManager.deviceId}`);
				localStorage.removeItem(`kite_initial_sync_complete_${session.id}`);
			}
		} catch(error) {
			console.error('Failed to clear data:', error);

			$.set(
				clearError,
				error instanceof Error
					? error.message
					: s('settings.sync.clear.errorFailed') || 'Failed to clear data',
				true
			);
		} finally {
			$.set(isClearing, false);
		}
	}

	// Reset to default view
	function resetView() {
		$.set(showClearConfirm, false);
		$.set(clearSuccess, false);
		$.set(clearError, null);
	}

	// Export synced data
	async function exportData() {
		if (!session?.loggedIn || !session?.id) {
			$.set(exportError, s('settings.sync.export.errorNotLoggedIn') || 'You must be logged in to export synced data', true);

			return;
		}

		$.set(isExporting, true);
		$.set(exportError, null);

		try {
			const response = await fetch('/api/sync/export', {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				throw new Error(s('settings.sync.export.errorFailed') || 'Failed to export data');
			}

			const data = await response.json();

			// Create a blob and download it
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `kagi-news-sync-data-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch(error) {
			console.error('Failed to export data:', error);

			$.set(
				exportError,
				error instanceof Error
					? error.message
					: s('settings.sync.export.errorFailed') || 'Failed to export data',
				true
			);
		} finally {
			$.set(isExporting, false);
		}
	}

	var div = root_9();
	var div_1 = $.child(div);
	var text = $.only_child(div_1, true);
	var node = $.sibling(div_1, 2);

	{
		var consequent_8 = ($$anchor) => {
			var fragment = root_7();
			var div_2 = $.first_child(fragment);
			var h3 = $.child(div_2);
			var text_1 = $.only_child(h3, true);
			var div_3 = $.sibling(h3, 2);
			var div_4 = $.child(div_3);
			var label = $.child(div_4);
			var div_5 = $.child(label);
			var div_6 = $.child(div_5);
			var span = $.child(div_6);
			var text_2 = $.only_child(span, true);
			var node_1 = $.sibling(span, 2);

			{
				var consequent = ($$anchor) => {
					IconLoader2($$anchor, { class: 'h-4 w-4 animate-spin text-yellow-600' });
				};

				$.if(node_1, ($$render) => {
					if ($.get(isSyncingSettings)) $$render(consequent);
				});
			}

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var text_3 = $.only_child(div_7, true);

			$.reset(div_5);

			var button = $.sibling(div_5, 2);
			var span_1 = $.only_child(button);

			$.reset(label);
			$.reset(div_4);

			var div_8 = $.sibling(div_4, 2);
			var label_1 = $.child(div_8);
			var div_9 = $.child(label_1);
			var div_10 = $.child(div_9);
			var span_2 = $.child(div_10);
			var text_4 = $.only_child(span_2, true);
			var node_2 = $.sibling(span_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					IconLoader2($$anchor, { class: 'h-4 w-4 animate-spin text-yellow-600' });
				};

				$.if(node_2, ($$render) => {
					if ($.get(isSyncingHistory)) $$render(consequent_1);
				});
			}

			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var text_5 = $.only_child(div_11, true);

			$.reset(div_9);

			var button_1 = $.sibling(div_9, 2);
			var span_3 = $.only_child(button_1);

			$.reset(label_1);
			$.reset(div_8);
			$.reset(div_3);

			var div_12 = $.sibling(div_3, 2);
			var p = $.child(div_12);
			var strong = $.child(p);
			var text_6 = $.only_child(strong, true);
			var text_7 = $.sibling(strong);

			$.reset(p);
			$.reset(div_12);
			$.reset(div_2);

			var div_13 = $.sibling(div_2, 2);
			var h3_1 = $.child(div_13);
			var text_8 = $.only_child(h3_1, true);
			var div_14 = $.sibling(h3_1, 2);
			var node_3 = $.child(div_14);

			{
				var consequent_2 = ($$anchor) => {
					var div_15 = root();
					var div_16 = $.child(div_15);
					var p_1 = $.sibling($.child(div_16), 2);
					var text_9 = $.only_child(p_1, true);

					$.reset(div_16);
					$.reset(div_15);

					$.template_effect(($0) => $.set_text(text_9, $0), [
						() => s("settings.sync.clear.deleting") || "Deleting your data..."
					]);

					$.append($$anchor, div_15);
				};

				var consequent_3 = ($$anchor) => {
					var div_17 = root_1();
					var p_2 = $.child(div_17);
					var text_10 = $.only_child(p_2, true);
					var p_3 = $.sibling(p_2, 2);
					var text_11 = $.only_child(p_3, true);
					var p_4 = $.sibling(p_3, 2);
					var text_12 = $.only_child(p_4, true);
					var div_18 = $.sibling(p_4, 2);
					var button_2 = $.child(div_18);
					var text_13 = $.only_child(button_2, true);
					var button_3 = $.sibling(button_2, 2);
					var node_4 = $.child(button_3);

					IconTrash(node_4, { size: 14 });

					var text_14 = $.sibling(node_4);

					$.reset(button_3);
					$.reset(div_18);
					$.reset(div_17);

					$.template_effect(
						($0, $1, $2, $3, $4) => {
							$.set_text(text_10, $0);
							$.set_text(text_11, $1);
							$.set_text(text_12, $2);
							$.set_text(text_13, $3);
							$.set_text(text_14, ` ${$4 ?? ''}`);
						},
						[
							() => s("settings.sync.clear.confirmTitle") || "Delete All Synced Data?",
							() => s("settings.sync.clear.confirmMessage") || "This will permanently delete all your synced settings and read history from Kagi servers. Your local data will remain intact.",
							() => s("settings.sync.clear.confirmWarning") || "This action cannot be undone.",
							() => s("ui.cancel") || "Cancel",
							() => s("settings.sync.clear.confirmButton") || "Delete"
						]
					);

					$.delegated('click', button_2, () => $.set(showClearConfirm, false));
					$.delegated('click', button_3, clearAllData);
					$.append($$anchor, div_17);
				};

				var consequent_4 = ($$anchor) => {
					var div_19 = root_2();
					var div_20 = $.child(div_19);
					var p_5 = $.sibling($.child(div_20), 2);
					var text_15 = $.only_child(p_5, true);

					$.reset(div_20);

					var button_4 = $.sibling(div_20, 2);
					var node_5 = $.child(button_4);

					IconArrowLeft(node_5, { size: 14 });

					var text_16 = $.sibling(node_5);

					$.reset(button_4);
					$.reset(div_19);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_15, $0);
							$.set_text(text_16, ` ${$1 ?? ''}`);
						},
						[
							() => s("settings.sync.clear.success") || "All synced data has been deleted successfully.",
							() => s("ui.back") || "Back"
						]
					);

					$.delegated('click', button_4, resetView);
					$.append($$anchor, div_19);
				};

				var consequent_5 = ($$anchor) => {
					var div_21 = root_3();
					var div_22 = $.child(div_21);
					var p_6 = $.sibling($.child(div_22), 2);
					var text_17 = $.only_child(p_6, true);

					$.reset(div_22);

					var button_5 = $.sibling(div_22, 2);
					var node_6 = $.child(button_5);

					IconArrowLeft(node_6, { size: 14 });

					var text_18 = $.sibling(node_6);

					$.reset(button_5);
					$.reset(div_21);

					$.template_effect(
						($0) => {
							$.set_text(text_17, $.get(clearError));
							$.set_text(text_18, ` ${$0 ?? ''}`);
						},
						[() => s("ui.back") || "Back"]
					);

					$.delegated('click', button_5, resetView);
					$.append($$anchor, div_21);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_3 = root_6();
					var p_7 = $.first_child(fragment_3);
					var text_19 = $.only_child(p_7, true);
					var div_23 = $.sibling(p_7, 2);
					var button_6 = $.child(div_23);
					var node_7 = $.child(button_6);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_4 = root_4();
							var node_8 = $.first_child(fragment_4);

							IconLoader2(node_8, { size: 16, class: 'animate-spin' });

							var text_20 = $.sibling(node_8);

							$.template_effect(($0) => $.set_text(text_20, ` ${$0 ?? ''}`), [() => s("settings.sync.export.exporting") || "Exporting..."]);
							$.append($$anchor, fragment_4);
						};

						var alternate = ($$anchor) => {
							var fragment_5 = root_4();
							var node_9 = $.first_child(fragment_5);

							IconDownload(node_9, { size: 16 });

							var text_21 = $.sibling(node_9);

							$.template_effect(($0) => $.set_text(text_21, ` ${$0 ?? ''}`), [() => s("settings.sync.export.button") || "Export Data"]);
							$.append($$anchor, fragment_5);
						};

						$.if(node_7, ($$render) => {
							if ($.get(isExporting)) $$render(consequent_6); else $$render(alternate, -1);
						});
					}

					$.reset(button_6);

					var button_7 = $.sibling(button_6, 2);
					var node_10 = $.child(button_7);

					IconTrash(node_10, { size: 16 });

					var text_22 = $.sibling(node_10);

					$.reset(button_7);
					$.reset(div_23);

					var node_11 = $.sibling(div_23, 2);

					{
						var consequent_7 = ($$anchor) => {
							var div_24 = root_5();
							var text_23 = $.only_child(div_24, true);

							$.template_effect(() => $.set_text(text_23, $.get(exportError)));
							$.append($$anchor, div_24);
						};

						$.if(node_11, ($$render) => {
							if ($.get(exportError)) $$render(consequent_7);
						});
					}

					$.template_effect(
						($0, $1) => {
							$.set_text(text_19, $0);
							button_6.disabled = $.get(isExporting);
							$.set_text(text_22, ` ${$1 ?? ''}`);
						},
						[
							() => s("settings.sync.clear.description") || "You are in control of your data. Export or delete your cloud data at any time. Deletion does not affect local data.",
							() => s("settings.sync.clear.button") || "Clear All Synced Data"
						]
					);

					$.delegated('click', button_6, exportData);
					$.delegated('click', button_7, () => $.set(showClearConfirm, true));
					$.append($$anchor, fragment_3);
				};

				$.if(node_3, ($$render) => {
					if ($.get(isClearing)) $$render(consequent_2); else if ($.get(showClearConfirm)) $$render(consequent_3, 1); else if ($.get(clearSuccess)) $$render(consequent_4, 2); else if ($.get(clearError)) $$render(consequent_5, 3); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_14);
			$.reset(div_13);

			$.template_effect(
				($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) => {
					$.set_text(text_1, $0);
					$.set_text(text_2, $1);
					$.set_text(text_3, $2);
					$.set_class(button, 1, `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${$.get(syncSettings) ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} ${$.get(isSyncingSettings) ? 'opacity-50' : ''}`);
					$.set_attribute(button, 'aria-checked', $.get(syncSettings));
					button.disabled = $.get(isSyncingSettings);
					$.set_attribute(button, 'title', $3);

					$.set_class(span_1, 1, `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${$.get(syncSettings)
						? 'ltr:translate-x-6 rtl:-translate-x-6'
						: 'ltr:translate-x-1 rtl:-translate-x-1'}`);

					$.set_text(text_4, $4);
					$.set_text(text_5, $5);
					$.set_class(button_1, 1, `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${$.get(syncReadHistory) ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} ${$.get(isSyncingHistory) ? 'opacity-50' : ''}`);
					$.set_attribute(button_1, 'aria-checked', $.get(syncReadHistory));
					button_1.disabled = $.get(isSyncingHistory);
					$.set_attribute(button_1, 'title', $6);

					$.set_class(span_3, 1, `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${$.get(syncReadHistory)
						? 'ltr:translate-x-6 rtl:-translate-x-6'
						: 'ltr:translate-x-1 rtl:-translate-x-1'}`);

					$.set_text(text_6, $7);

					$.set_text(text_7, `  
          ${$8 ?? ''}`);

					$.set_text(text_8, $9);
				},
				[
					() => s("settings.sync.toggles.title") || "Sync Preferences",
					() => s("settings.sync.settings.label") || "Sync Settings",
					() => s("settings.sync.settings.description") || "Font size, story count, and other preferences",
					() => !$.get(syncSettings)
						? s("settings.sync.settings.enableInfo") || "When enabled, your current settings will be uploaded and shared across all your devices"
						: "",
					() => s("settings.sync.readHistory.label") || "Sync Read History",
					() => s("settings.sync.readHistory.description") || "Stories you've read across all categories",
					() => !$.get(syncReadHistory)
						? s("settings.sync.readHistory.enableInfo") || "When enabled, your read history will be uploaded and synced across all your devices"
						: "",
					() => s("settings.sync.mobileApp.title") || "Note:",
					() => s("settings.sync.mobileApp.description") || "Native iOS and Android apps currently do not support syncing. Sync works on web browsers (including PWA). We'll be adding native app support soon.",
					() => s("settings.sync.clear.title") || "Data Management"
				]
			);

			$.delegated('click', button, toggleSyncSettings);
			$.delegated('click', button_1, toggleSyncReadHistory);
			$.append($$anchor, fragment);
		};

		var alternate_2 = ($$anchor) => {
			var div_25 = root_8();
			var h3_2 = $.sibling($.child(div_25), 2);
			var text_24 = $.only_child(h3_2, true);
			var p_8 = $.sibling(h3_2, 2);
			var text_25 = $.only_child(p_8, true);
			var div_26 = $.sibling(p_8, 2);
			var a_1 = $.child(div_26);
			var text_26 = $.only_child(a_1, true);

			$.reset(div_26);
			$.reset(div_25);

			$.template_effect(
				($0, $1, $2) => {
					$.set_text(text_24, $0);
					$.set_text(text_25, $1);
					$.set_text(text_26, $2);
				},
				[
					() => s("settings.sync.notLoggedIn.title") || "Sign In Required",
					() => s("settings.sync.notLoggedIn.description") || "Sign in to your Kagi account to sync your settings and read history across devices.",
					() => s("settings.sync.notLoggedIn.signIn") || "Sign In"
				]
			);

			$.append($$anchor, div_25);
		};

		$.if(node, ($$render) => {
			if (session?.loggedIn && session?.id) $$render(consequent_8); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => s("settings.sync.info.description") || "Kagi News can sync your settings and read history across all your devices. This data is stored securely on Kagi servers and associated with your account.\n\nYour synced data is not used for any other purpose, not shared with anyone, and is solely stored to provide the sync service to you. You have full control over what gets synced and can delete your data at any time."
	]);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);