import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconArrowUp, IconArrowDown, IconArrowsExchange, IconLoader2 } from '@tabler/icons-svelte';
import BaseModal from '$lib/components/BaseModal.svelte';
import { s } from '$lib/client/localization.svelte';
import { downloadSettingsBackup } from '$lib/client/settings-backup';
import { syncManager } from '$lib/client/sync-manager';
import { settings } from '$lib/data/settings.svelte';
import { safeSetItem, safeRemoveItem } from '$lib/client/utils/safe-storage';

var root = $.from_html(`<p class="mb-4 text-sm text-gray-600 dark:text-gray-400"> </p> <div class="space-y-3"><button class="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"><div class="flex items-start gap-3"><div class="mt-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 p-2 text-blue-600 dark:text-blue-400"><!></div> <div><div class="text-sm font-medium text-gray-900 dark:text-gray-100"> </div> <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"> </div></div></div></button> <button class="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"><div class="flex items-start gap-3"><div class="mt-0.5 rounded-lg bg-green-100 dark:bg-green-900/40 p-2 text-green-600 dark:text-green-400"><!></div> <div><div class="text-sm font-medium text-gray-900 dark:text-gray-100"> </div> <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"> </div></div></div></button> <button class="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"><div class="flex items-start gap-3"><div class="mt-0.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 p-2 text-purple-600 dark:text-purple-400"><!></div> <div><div class="text-sm font-medium text-gray-900 dark:text-gray-100"> </div> <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"> </div></div></div></button></div>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center justify-center py-8 gap-3"><!> <p class="text-sm text-gray-600 dark:text-gray-400"> </p></div>`);
var root_2 = $.from_html(`<div class="flex flex-col items-center justify-center py-8 gap-3"><svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> <p class="text-sm text-gray-600 dark:text-gray-400"> </p></div>`);
var root_3 = $.from_html(`<div class="flex flex-col items-center justify-center py-8 gap-3"><svg class="h-8 w-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg> <p class="text-sm text-red-600 dark:text-red-400"> </p> <button class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"> </button></div>`);
var root_4 = $.from_html(`<div class="p-5"><!></div>`);

export default function SyncSetupModal($$anchor, $$props) {
	$.push($$props, true);

	let step = $.state('choose');
	let syncingLabel = $.state('');
	let errorMessage = $.state('');

	async function pushLocal() {
		$.set(step, 'syncing');
		$.set(syncingLabel, s('syncSetup.syncing.pushing') || 'Uploading your settings...', true);

		try {
			// Backup before overwriting remote
			downloadSettingsBackup();

			// Clear remote, then push all local
			await fetch('/api/sync/clear', { method: 'POST', credentials: 'include' });

			await syncManager.sync(true, true);
			$.set(step, 'done');

			setTimeout(
				() => {
					$$props.onComplete();
				},
				1200
			);
		} catch(e) {
			$.set(errorMessage, e instanceof Error ? e.message : 'Sync failed', true);
			$.set(step, 'error');
		}
	}

	async function pullRemote() {
		$.set(step, 'syncing');
		$.set(syncingLabel, s('syncSetup.syncing.pulling') || 'Downloading cloud settings...', true);

		try {
			// Backup local before overwriting
			downloadSettingsBackup();

			// Apply remote settings to local
			const settingsMap = settings;

			for (const remote of $$props.remoteSettings) {
				const key = remote.settingKey;
				const value = remote.settingValue;

				if (value === null) {
					safeRemoveItem(key);
				} else if (typeof value === 'string') {
					safeSetItem(key, value);
				} else {
					safeSetItem(key, JSON.stringify(value));
				}

				// Also update Setting objects so UI reflects changes
				for (const setting of Object.values(settingsMap)) {
					if (setting.key === key) {
						setting.currentValue = typeof value === 'string' ? tryParse(value) : value;
						setting.originalValue = setting.currentValue;

						break;
					}
				}
			}

			// Now push the merged state to server so it's in sync
			await syncManager.sync(true, true);

			$.set(step, 'done');

			setTimeout(
				() => {
					$$props.onComplete();
				},
				1200
			);
		} catch(e) {
			$.set(errorMessage, e instanceof Error ? e.message : 'Sync failed', true);
			$.set(step, 'error');
		}
	}

	async function merge() {
		$.set(step, 'syncing');
		$.set(syncingLabel, s('syncSetup.syncing.merging') || 'Merging settings...', true);

		try {
			// Just push local — server merges via LWW, local wins ties,
			// remote-only settings are preserved
			await syncManager.sync(true, true);

			$.set(step, 'done');

			setTimeout(
				() => {
					$$props.onComplete();
				},
				1200
			);
		} catch(e) {
			$.set(errorMessage, e instanceof Error ? e.message : 'Sync failed', true);
			$.set(step, 'error');
		}
	}

	function tryParse(value) {
		try {
			if (value.startsWith('{') || value.startsWith('[') || value === 'true' || value === 'false') {
				return JSON.parse(value);
			}
		} catch {
			// ignore
		}

		return value;
	}

	{
		let $0 = $.derived(() => s('syncSetup.title') || 'Set Up Sync');
		let $1 = $.derived(() => $.get(step) === 'choose' || $.get(step) === 'error');
		let $2 = $.derived(() => $.get(step) === 'choose' || $.get(step) === 'error');
		let $3 = $.derived(() => $.get(step) === 'choose' || $.get(step) === 'error');

		BaseModal($$anchor, {
			get isOpen() {
				return $$props.isOpen;
			},

			onClose: () => {
				if ($.get(step) === 'choose' || $.get(step) === 'error') $$props.onClose();
			},

			get title() {
				return $.get($0);
			},
			size: 'sm',
			position: 'center',
			get closeOnBackdrop() {
				return $.get($1);
			},

			get closeOnEscape() {
				return $.get($2);
			},

			get showCloseButton() {
				return $.get($3);
			},

			children: ($$anchor, $$slotProps) => {
				var div = root_4();
				var node = $.child(div);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root();
						var p = $.first_child(fragment_1);
						var text = $.only_child(p, true);
						var div_1 = $.sibling(p, 2);
						var button = $.child(div_1);
						var div_2 = $.child(button);
						var div_3 = $.child(div_2);
						var node_1 = $.child(div_3);

						IconArrowUp(node_1, { size: 18 });
						$.reset(div_3);

						var div_4 = $.sibling(div_3, 2);
						var div_5 = $.child(div_4);
						var text_1 = $.only_child(div_5, true);
						var div_6 = $.sibling(div_5, 2);
						var text_2 = $.only_child(div_6, true);

						$.reset(div_4);
						$.reset(div_2);
						$.reset(button);

						var button_1 = $.sibling(button, 2);
						var div_7 = $.child(button_1);
						var div_8 = $.child(div_7);
						var node_2 = $.child(div_8);

						IconArrowDown(node_2, { size: 18 });
						$.reset(div_8);

						var div_9 = $.sibling(div_8, 2);
						var div_10 = $.child(div_9);
						var text_3 = $.only_child(div_10, true);
						var div_11 = $.sibling(div_10, 2);
						var text_4 = $.only_child(div_11, true);

						$.reset(div_9);
						$.reset(div_7);
						$.reset(button_1);

						var button_2 = $.sibling(button_1, 2);
						var div_12 = $.child(button_2);
						var div_13 = $.child(div_12);
						var node_3 = $.child(div_13);

						IconArrowsExchange(node_3, { size: 18 });
						$.reset(div_13);

						var div_14 = $.sibling(div_13, 2);
						var div_15 = $.child(div_14);
						var text_5 = $.only_child(div_15, true);
						var div_16 = $.sibling(div_15, 2);
						var text_6 = $.only_child(div_16, true);

						$.reset(div_14);
						$.reset(div_12);
						$.reset(button_2);
						$.reset(div_1);

						$.template_effect(
							($0, $1, $2, $3, $4, $5, $6) => {
								$.set_text(text, $0);
								$.set_text(text_1, $1);
								$.set_text(text_2, $2);
								$.set_text(text_3, $3);
								$.set_text(text_4, $4);
								$.set_text(text_5, $5);
								$.set_text(text_6, $6);
							},
							[
								() => s('syncSetup.description') || 'We found existing settings on your account from another device. How would you like to proceed?',
								() => s('syncSetup.pushLocal.title') || 'Use this device',
								() => s('syncSetup.pushLocal.description') || 'Replace cloud settings with your current settings',
								() => s('syncSetup.pullRemote.title') || 'Use cloud settings',
								() => s('syncSetup.pullRemote.description') || 'Replace your current settings with cloud settings',
								() => s('syncSetup.merge.title') || 'Merge',
								() => s('syncSetup.merge.description') || 'Keep your settings and add any missing cloud settings'
							]
						);

						$.delegated('click', button, pushLocal);
						$.delegated('click', button_1, pullRemote);
						$.delegated('click', button_2, merge);
						$.append($$anchor, fragment_1);
					};

					var consequent_1 = ($$anchor) => {
						var div_17 = root_1();
						var node_4 = $.child(div_17);

						IconLoader2(node_4, {
							size: 28,
							class: 'animate-spin text-blue-600 dark:text-blue-400'
						});

						var p_1 = $.sibling(node_4, 2);
						var text_7 = $.only_child(p_1, true);

						$.reset(div_17);
						$.template_effect(() => $.set_text(text_7, $.get(syncingLabel)));
						$.append($$anchor, div_17);
					};

					var consequent_2 = ($$anchor) => {
						var div_18 = root_2();
						var p_2 = $.sibling($.child(div_18), 2);
						var text_8 = $.only_child(p_2, true);

						$.reset(div_18);
						$.template_effect(($0) => $.set_text(text_8, $0), [() => s('syncSetup.done') || 'Settings synced successfully!']);
						$.append($$anchor, div_18);
					};

					var consequent_3 = ($$anchor) => {
						var div_19 = root_3();
						var p_3 = $.sibling($.child(div_19), 2);
						var text_9 = $.only_child(p_3, true);
						var button_3 = $.sibling(p_3, 2);
						var text_10 = $.only_child(button_3, true);

						$.reset(div_19);

						$.template_effect(
							($0) => {
								$.set_text(text_9, $.get(errorMessage));
								$.set_text(text_10, $0);
							},
							[() => s('syncSetup.tryAgain') || 'Try again']
						);

						$.delegated('click', button_3, () => {
							$.set(step, 'choose');
						});

						$.append($$anchor, div_19);
					};

					$.if(node, ($$render) => {
						if ($.get(step) === 'choose') $$render(consequent); else if ($.get(step) === 'syncing') $$render(consequent_1, 1); else if ($.get(step) === 'done') $$render(consequent_2, 2); else if ($.get(step) === 'error') $$render(consequent_3, 3);
					});
				}

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}

$.delegate(['click']);