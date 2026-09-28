import * as $ from 'svelte/internal/server';

import {
	IconCheck,
	IconDownload,
	IconInfoCircle,
	IconPlus,
	IconUpload,
	IconX
} from '@tabler/icons-svelte';

import { s } from '$lib/client/localization.svelte';
import Select from '$lib/components/Select.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { contentFilter } from '$lib/stores/contentFilter.svelte';
import { dataLanguage } from '$lib/stores/dataLanguage.svelte';

export default function SettingsFilters($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// State
		let newKeyword = '';

		let inputElement = void 0;
		let previousLanguage = dataLanguage.current;
		let showResetConfirm = false;
		let resetButtonElement = void 0;
		let showImportConfirm = false;
		let importButtonElement = void 0;
		let fileInputElement = void 0;
		let importWarning = void 0;
		let pendingImportData = void 0;

		// Update keywords when data language changes
		// Get localized preset labels and tooltips
		const localizedPresets = $.derived(() => contentFilter.presets.map((preset) => {
			// Try to get translated label, fall back to original
			const translatedLabel = s(`settings.contentFilter.preset.${preset.id}`);

			const label = translatedLabel !== `settings.contentFilter.preset.${preset.id}` ? translatedLabel : preset.label;

			// Only show tooltip if we have a translation for it
			const tooltipKey = `settings.contentFilter.preset.${preset.id}.tooltip`;

			const translatedTooltip = s(tooltipKey);
			const tooltip = translatedTooltip !== tooltipKey ? translatedTooltip : null;

			return { ...preset, label, tooltip };
		}));

		// Add keyword
		function addKeyword() {
			if (!newKeyword.trim()) return;

			// Split by commas and add all keywords
			const keywords = newKeyword.split(',').map((k) => k.trim()).filter((k) => k);

			for (const k of keywords) {
				contentFilter.addCustomKeyword(k);
			}

			newKeyword = '';

			// Focus back on input
			inputElement?.focus();
		}

		// Handle enter key
		function handleKeydown(event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				addKeyword();
			}
		}

		// Reset to defaults
		function resetToDefaults() {
			contentFilter.reset();
			showResetConfirm = false;
		}

		// Handle clicks outside reset confirm
		function handleOutsideClick(event) {
			if (showResetConfirm && resetButtonElement && !resetButtonElement.contains(event.target)) {
				const confirmEl = document.getElementById('reset-confirm-popup');

				if (confirmEl && !confirmEl.contains(event.target)) {
					showResetConfirm = false;
				}
			}
		}

		// Listen for outside clicks
		// Helper to get keywords for a preset in the current language
		function getPresetKeywords(preset) {
			if (Array.isArray(preset.keywords)) {
				return preset.keywords;
			}

			return preset.keywords[dataLanguage.current] || preset.keywords.default || preset.keywords.en || [];
		}

		// Check if we have custom keywords (not from presets)
		const customKeywords = $.derived(() => {
			// Get all keywords from active presets
			const presetKeywords = new Set();

			for (const presetId of contentFilter.activePresets) {
				const preset = contentFilter.presets.find((p) => p.id === presetId);

				if (preset) {
					const keywords = getPresetKeywords(preset);

					for (const k of keywords) {
						presetKeywords.add(k);
					}
				}
			}

			// Return keywords that are not from presets
			return contentFilter.keywords.filter((k) => !presetKeywords.has(k));
		});

		// Export configuration
		function exportConfig() {
			const config = contentFilter.exportConfig();
			const blob = new Blob([config], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `kite-content-filters-${new Date().toISOString().split('T')[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);
		}

		// Handle file selection
		function handleFileSelect(event) {
			const input = event.target;
			const file = input.files?.[0];

			if (!file) return;

			const reader = new FileReader();

			reader.onload = (e) => {
				const content = e.target?.result;

				// Pre-validate the import
				const result = contentFilter.importConfig(content);

				if (result.errorKey) {
					alert(s(result.errorKey) || result.errorKey);

					return;
				}

				// Store the data and show confirmation
				pendingImportData = content;

				importWarning = result.warningKey ? s(result.warningKey) || result.warningKey : undefined;
				showImportConfirm = true;
			};

			reader.readAsText(file);
		}

		// Confirm import
		function confirmImport() {
			if (pendingImportData) {
				contentFilter.importConfig(pendingImportData);
				showImportConfirm = false;
				pendingImportData = undefined;
				importWarning = undefined;

				// Reset file input
				if (fileInputElement) fileInputElement.value = '';
			}
		}

		// Handle clicks outside import confirm
		function handleImportOutsideClick(event) {
			if (showImportConfirm && importButtonElement && !importButtonElement.contains(event.target)) {
				const confirmEl = document.getElementById('import-confirm-popup');

				if (confirmEl && !confirmEl.contains(event.target)) {
					showImportConfirm = false;
					pendingImportData = undefined;
					importWarning = undefined;

					if (fileInputElement) fileInputElement.value = '';
				}
			}
		}

		$$renderer.push(`<div class="space-y-6"><div class="text-sm text-gray-600 dark:text-gray-400">${$.escape(
			// Listen for import outside clicks
			s("settings.contentFilter.tab.description") || "Customize your news feed by filtering out topics you prefer not to see. Use presets for common filters or create your own custom keywords."
		)}</div> <div><div class="flex items-center justify-between mb-1"><h3 class="text-base font-medium text-gray-900 dark:text-gray-100">${$.escape(s("settings.contentFilter.presets.label") || "Filter Presets")}</h3> <a href="https://github.com/kagisearch/kite-public" target="_blank" class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">${$.escape(s("settings.contentFilter.contribute") || "Add more filters")}</a></div> <p class="mt-0.5 mb-3 text-sm text-gray-500 dark:text-gray-400">${$.escape(s("settings.contentFilter.presets.description") || "Select one or more preset filters to quickly hide common topics")}</p> <div class="grid grid-cols-2 gap-2 auto-rows-fr"><!--[-->`);

		const each_array = $.ensure_array_like(localizedPresets());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let preset = each_array[$$index];

			$$renderer.push(`<button${$.attr_class(`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md border transition-colors ${contentFilter.isPresetActive(preset.id)
				? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
				: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`)}><span class="flex items-center gap-2">${$.escape(preset.label)} `);

			if (preset.tooltip) {
				$$renderer.push('<!--[0-->');

				Tooltip($$renderer, {
					text: preset.tooltip,
					position: 'top',
					children: ($$renderer) => {
						IconInfoCircle($$renderer, { size: 14, class: 'text-gray-400 dark:text-gray-500' });
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></span> `);

			if (contentFilter.isPresetActive(preset.id)) {
				$$renderer.push('<!--[0-->');
				IconCheck($$renderer, { size: 16 });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]--></div></div> <div><label for="keyword-input" class="text-base font-medium text-gray-900 dark:text-gray-100">${$.escape(s("settings.contentFilter.keywords.label") || "Custom Keywords")}</label> <p class="mt-0.5 mb-2 text-sm text-gray-500 dark:text-gray-400">${$.escape(s("settings.contentFilter.keywords.description") || "Add your own keywords to filter, separated by commas")}</p> <div class="flex gap-2"><input id="keyword-input" type="text"${$.attr('value', newKeyword)}${$.attr('placeholder', s("settings.contentFilter.keywords.placeholder") || "e.g., celebrity name, topic")} class="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-gray-700"/> <button${$.attr('disabled', !newKeyword.trim(), true)} class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-600">`);
		IconPlus($$renderer, { size: 20 });
		$$renderer.push(`<!----></button></div></div> `);

		if (contentFilter.keywords.length > 0) {
			$$renderer.push(`<!--[0--><div><h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${$.escape(s("settings.contentFilter.activeFilters") || "Active Filters")}</h4> <!--[-->`);

			const each_array_1 = $.ensure_array_like(contentFilter.activePresets);

			for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
				let presetId = each_array_1[$$index_2];
				const preset = localizedPresets().find((p) => p.id === presetId);

				if (preset) {
					$$renderer.push(`<!--[0--><div class="mb-3"><div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${$.escape(preset.label)}:</div> <div class="flex flex-wrap gap-2"><!--[-->`);

					const each_array_2 = $.ensure_array_like(getPresetKeywords(preset));

					for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
						let keyword = each_array_2[$$index_1];

						$$renderer.push(`<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">${$.escape(keyword)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--> `);

			if (customKeywords().length > 0) {
				$$renderer.push(`<!--[0--><div class="mb-3"><div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${$.escape(s("settings.contentFilter.customKeywords") || "Custom")}:</div> <div class="flex flex-wrap gap-2"><!--[-->`);

				const each_array_3 = $.ensure_array_like(customKeywords());

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let keyword = each_array_3[$$index_3];

					$$renderer.push(`<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">${$.escape(keyword)} <button class="ms-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"${$.attr('aria-label', `Remove ${$.stringify(keyword)}`)}>`);
					IconX($$renderer, { size: 16 });
					$$renderer.push(`<!----></button></span>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button class="mt-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">${$.escape(s("settings.contentFilter.clearAll") || "Clear all filters")}</button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <fieldset><legend class="text-base font-medium text-gray-900 dark:text-gray-100">${$.escape(s("settings.contentFilter.mode.label") || "Filter Mode")}</legend> <p class="mt-0.5 mb-2 text-sm text-gray-500 dark:text-gray-400">${$.escape(s("settings.contentFilter.mode.description") || "Choose how filtered content is handled")}</p> <div class="space-y-2"><label class="flex items-start"><input type="radio" name="filter-mode" value="hide"${$.attr('checked', contentFilter.filterMode === "hide", true)} class="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"/> <div class="ms-3"><span class="block text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.contentFilter.mode.hide") || "Hide completely")}</span> <span class="block text-sm text-gray-500 dark:text-gray-400">${$.escape(s("settings.contentFilter.mode.hideDescription") || "Filtered stories are removed from view")}</span></div></label> <label class="flex items-start"><input type="radio" name="filter-mode" value="blur"${$.attr('checked', contentFilter.filterMode === "blur", true)} class="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"/> <div class="ms-3"><span class="block text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.contentFilter.mode.blur") || "Blur with warning")}</span> <span class="block text-sm text-gray-500 dark:text-gray-400">${$.escape(s("settings.contentFilter.mode.blurDescription") || "Stories are blurred and can be revealed on click")}</span></div></label></div></fieldset> <div class="space-y-2">`);

		Select($$renderer, {
			value: contentFilter.filterScope,
			options: [
				{
					value: "title",
					label: s("settings.contentFilter.scope.title") || "Title only"
				},

				{
					value: "summary",
					label: s("settings.contentFilter.scope.summary") || "Title and summary"
				},

				{
					value: "all",
					label: s("settings.contentFilter.scope.all") || "All content"
				}
			],
			label: s("settings.contentFilter.scope.label") || "Filter Scope",
			onChange: (value) => contentFilter.setFilterScope(value)
		});

		$$renderer.push(`<!----> <p class="text-sm text-gray-500 dark:text-gray-400">${$.escape(s("settings.contentFilter.scope.description") || "Choose which parts of stories to check for keywords")}</p></div> <div class="flex items-center justify-between"><div><span id="label-show-count" class="text-base font-medium text-gray-900 dark:text-gray-100">${$.escape(s("settings.contentFilter.showCount.label") || "Show Filtered Count")}</span> <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">${$.escape(s("settings.contentFilter.showCount.description") || "Display number of filtered stories in each category")}</p></div> <button id="show-count" role="switch"${$.attr('aria-checked', contentFilter.showFilteredCount)} aria-labelledby="label-show-count"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition-colors', void 0, {
			'bg-blue-600': contentFilter.showFilteredCount,
			'bg-gray-200': !contentFilter.showFilteredCount,
			'dark:bg-gray-600': !contentFilter.showFilteredCount
		})}><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
			'ltr:translate-x-6': contentFilter.showFilteredCount,
			'rtl:-translate-x-6': contentFilter.showFilteredCount,
			'ltr:translate-x-1': !contentFilter.showFilteredCount,
			'rtl:-translate-x-1': !contentFilter.showFilteredCount
		})}></span></button></div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700"><h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">${$.escape(s("settings.contentFilter.exportImport.title") || "Backup & Restore")}</h4> <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${$.escape(s("settings.contentFilter.exportImport.description") || "Export your filter settings to a file or import from a previous backup")}</p> <div class="flex gap-3 relative"><button class="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300">`);

		IconDownload($$renderer, { size: 16 });
		$$renderer.push(`<!----> ${$.escape(s("settings.contentFilter.export") || "Export Settings")}</button> <button class="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300">`);
		IconUpload($$renderer, { size: 16 });
		$$renderer.push(`<!----> ${$.escape(s("settings.contentFilter.import") || "Import Settings")}</button> <input type="file" accept=".json" class="hidden"/> `);

		if (showImportConfirm) {
			$$renderer.push(`<!--[0--><div id="import-confirm-popup" class="absolute bottom-full mb-2 left-0 z-50 animate-in fade-in slide-in-from-bottom-1"><div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80"><h5 class="font-medium text-gray-900 dark:text-gray-100 mb-2">${$.escape(s("settings.contentFilter.importConfirm.title") || "Import Settings?")}</h5> <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">${$.escape(s("settings.contentFilter.importConfirm.warning") || "This will replace all current filter settings.")}</p> `);

			if (importWarning) {
				$$renderer.push(`<!--[0--><div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 mb-3"><p class="text-xs text-yellow-800 dark:text-yellow-300">⚠️ ${$.escape(importWarning)}</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">${$.escape(s("settings.contentFilter.importConfirm.backup") || "Tip: Export your current settings first to create a backup.")}</p> <div class="flex gap-2 justify-end"><button class="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300">${$.escape(s("common.cancel") || "Cancel")}</button> <button class="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">${$.escape(s("settings.contentFilter.importConfirm.action") || "Import")}</button></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700 relative"><button class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">${$.escape(s("settings.contentFilter.reset") || "Reset to Defaults")}</button> `);

		if (showResetConfirm) {
			$$renderer.push(`<!--[0--><div id="reset-confirm-popup" class="absolute bottom-full mb-2 left-0 z-50 animate-in fade-in slide-in-from-bottom-1"><div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-72"><p class="text-sm text-gray-700 dark:text-gray-300 mb-3">${$.escape(s("settings.contentFilter.resetModal.description") || "This will clear all filters and reset settings to defaults.")}</p> <div class="flex gap-2 justify-end"><button class="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300">${$.escape(s("common.cancel") || "Cancel")}</button> <button class="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md">${$.escape(s("common.reset") || "Reset")}</button></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}