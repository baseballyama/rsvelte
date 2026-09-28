import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<button><span class="flex items-center gap-2"> <!></span> <!></button>`);
var root_1 = $.from_html(`<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"> </span>`);
var root_2 = $.from_html(`<div class="mb-3"><div class="text-xs text-gray-500 dark:text-gray-400 mb-1"> </div> <div class="flex flex-wrap gap-2"></div></div>`);
var root_3 = $.from_html(`<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"> <button class="ms-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><!></button></span>`);
var root_4 = $.from_html(`<div><h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> </h4> <!> <!> <button class="mt-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"> </button></div>`);
var root_5 = $.from_html(`<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 mb-3"><p class="text-xs text-yellow-800 dark:text-yellow-300"> </p></div>`);
var root_6 = $.from_html(`<div id="import-confirm-popup" class="absolute bottom-full mb-2 left-0 z-50 animate-in fade-in slide-in-from-bottom-1"><div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80"><h5 class="font-medium text-gray-900 dark:text-gray-100 mb-2"> </h5> <p class="text-sm text-gray-700 dark:text-gray-300 mb-2"> </p> <!> <p class="text-xs text-gray-500 dark:text-gray-400 mb-3"> </p> <div class="flex gap-2 justify-end"><button class="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"> </button> <button class="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"> </button></div></div></div>`);
var root_7 = $.from_html(`<div id="reset-confirm-popup" class="absolute bottom-full mb-2 left-0 z-50 animate-in fade-in slide-in-from-bottom-1"><div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-72"><p class="text-sm text-gray-700 dark:text-gray-300 mb-3"> </p> <div class="flex gap-2 justify-end"><button class="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"> </button> <button class="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"> </button></div></div></div>`);
var root_8 = $.from_html(`<div class="space-y-6"><div class="text-sm text-gray-600 dark:text-gray-400"> </div> <div><div class="flex items-center justify-between mb-1"><h3 class="text-base font-medium text-gray-900 dark:text-gray-100"> </h3> <a href="https://github.com/kagisearch/kite-public" target="_blank" class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"> </a></div> <p class="mt-0.5 mb-3 text-sm text-gray-500 dark:text-gray-400"> </p> <div class="grid grid-cols-2 gap-2 auto-rows-fr"></div></div> <div><label for="keyword-input" class="text-base font-medium text-gray-900 dark:text-gray-100"> </label> <p class="mt-0.5 mb-2 text-sm text-gray-500 dark:text-gray-400"> </p> <div class="flex gap-2"><input id="keyword-input" type="text" class="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-gray-700"/> <button class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-600"><!></button></div></div> <!> <fieldset><legend class="text-base font-medium text-gray-900 dark:text-gray-100"> </legend> <p class="mt-0.5 mb-2 text-sm text-gray-500 dark:text-gray-400"> </p> <div class="space-y-2"><label class="flex items-start"><input type="radio" name="filter-mode" value="hide" class="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"/> <div class="ms-3"><span class="block text-sm font-medium text-gray-700 dark:text-gray-300"> </span> <span class="block text-sm text-gray-500 dark:text-gray-400"> </span></div></label> <label class="flex items-start"><input type="radio" name="filter-mode" value="blur" class="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"/> <div class="ms-3"><span class="block text-sm font-medium text-gray-700 dark:text-gray-300"> </span> <span class="block text-sm text-gray-500 dark:text-gray-400"> </span></div></label></div></fieldset> <div class="space-y-2"><!> <p class="text-sm text-gray-500 dark:text-gray-400"> </p></div> <div class="flex items-center justify-between"><div><span id="label-show-count" class="text-base font-medium text-gray-900 dark:text-gray-100"> </span> <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400"> </p></div> <button id="show-count" role="switch" aria-labelledby="label-show-count"><span></span></button></div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700"><h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"> </h4> <p class="text-sm text-gray-500 dark:text-gray-400 mb-3"> </p> <div class="flex gap-3 relative"><button class="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"><!> </button> <button class="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"><!> </button> <input type="file" accept=".json" class="hidden"/> <!></div></div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700 relative"><button class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"> </button> <!></div></div>`);

export default function SettingsContentFilter($$anchor, $$props) {
	$.push($$props, true);

	// State
	let newKeyword = $.state('');

	let inputElement = $.state(void 0);
	let previousLanguage = $.state($.proxy(dataLanguage.current));
	let showResetConfirm = $.state(false);
	let resetButtonElement = $.state(void 0);
	let showImportConfirm = $.state(false);
	let importButtonElement = $.state(void 0);
	let fileInputElement = $.state(void 0);
	let importWarning = $.state(void 0);
	let pendingImportData = $.state(void 0);

	// Update keywords when data language changes
	$.user_effect(() => {
		if ($.get(previousLanguage) !== dataLanguage.current) {
			$.set(previousLanguage, dataLanguage.current, true);
			contentFilter.updateLanguage(dataLanguage.current);
		}
	});

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
		if (!$.get(newKeyword).trim()) return;

		// Split by commas and add all keywords
		const keywords = $.get(newKeyword).split(',').map((k) => k.trim()).filter((k) => k);

		for (const k of keywords) {
			contentFilter.addCustomKeyword(k);
		}

		$.set(newKeyword, '');

		// Focus back on input
		$.get(inputElement)?.focus();
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
		$.set(showResetConfirm, false);
	}

	// Handle clicks outside reset confirm
	function handleOutsideClick(event) {
		if ($.get(showResetConfirm) && $.get(resetButtonElement) && !$.get(resetButtonElement).contains(event.target)) {
			const confirmEl = document.getElementById('reset-confirm-popup');

			if (confirmEl && !confirmEl.contains(event.target)) {
				$.set(showResetConfirm, false);
			}
		}
	}

	// Listen for outside clicks
	$.user_effect(() => {
		if ($.get(showResetConfirm)) {
			document.addEventListener('click', handleOutsideClick);

			return () => document.removeEventListener('click', handleOutsideClick);
		}
	});

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
			$.set(pendingImportData, content, true);

			$.set(importWarning, result.warningKey ? s(result.warningKey) || result.warningKey : undefined, true);
			$.set(showImportConfirm, true);
		};

		reader.readAsText(file);
	}

	// Confirm import
	function confirmImport() {
		if ($.get(pendingImportData)) {
			contentFilter.importConfig($.get(pendingImportData));
			$.set(showImportConfirm, false);
			$.set(pendingImportData, undefined);
			$.set(importWarning, undefined);

			// Reset file input
			if ($.get(fileInputElement)) $.get(fileInputElement).value = '';
		}
	}

	// Handle clicks outside import confirm
	function handleImportOutsideClick(event) {
		if ($.get(showImportConfirm) && $.get(importButtonElement) && !$.get(importButtonElement).contains(event.target)) {
			const confirmEl = document.getElementById('import-confirm-popup');

			if (confirmEl && !confirmEl.contains(event.target)) {
				$.set(showImportConfirm, false);
				$.set(pendingImportData, undefined);
				$.set(importWarning, undefined);

				if ($.get(fileInputElement)) $.get(fileInputElement).value = '';
			}
		}
	}

	// Listen for import outside clicks
	$.user_effect(() => {
		if ($.get(showImportConfirm)) {
			document.addEventListener('click', handleImportOutsideClick);

			return () => document.removeEventListener('click', handleImportOutsideClick);
		}
	});

	var div = root_8();
	var div_1 = $.child(div);
	var text = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var h3 = $.child(div_3);
	var text_1 = $.only_child(h3, true);
	var a_1 = $.sibling(h3, 2);
	var text_2 = $.only_child(a_1, true);

	$.reset(div_3);

	var p_1 = $.sibling(div_3, 2);
	var text_3 = $.only_child(p_1, true);
	var div_4 = $.sibling(p_1, 2);

	$.each(div_4, 21, () => $.get(localizedPresets), $.index, ($$anchor, preset) => {
		var button = root();
		var span = $.child(button);
		var text_4 = $.child(span);
		var node = $.sibling(text_4);

		{
			var consequent = ($$anchor) => {
				Tooltip($$anchor, {
					get text() {
						return $.get(preset).tooltip;
					},
					position: 'top',
					children: ($$anchor, $$slotProps) => {
						IconInfoCircle($$anchor, { size: 14, class: 'text-gray-400 dark:text-gray-500' });
					},
					$$slots: { default: true }
				});
			};

			$.if(node, ($$render) => {
				if ($.get(preset).tooltip) $$render(consequent);
			});
		}

		$.reset(span);

		var node_1 = $.sibling(span, 2);

		{
			var consequent_1 = ($$anchor) => {
				IconCheck($$anchor, { size: 16 });
			};

			var d = $.derived(() => contentFilter.isPresetActive($.get(preset).id));

			$.if(node_1, ($$render) => {
				if ($.get(d)) $$render(consequent_1);
			});
		}

		$.reset(button);

		$.template_effect(
			($0) => {
				$.set_class(button, 1, `flex items-center justify-between w-full px-3 py-2 text-sm rounded-md border transition-colors
						${$0 ?? ''}`);

				$.set_text(text_4, `${$.get(preset).label ?? ''} `);
			},
			[
				() => contentFilter.isPresetActive($.get(preset).id)
					? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
					: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
			]
		);

		$.delegated('click', button, () => contentFilter.togglePreset($.get(preset).id, dataLanguage.current));
		$.append($$anchor, button);
	});

	$.reset(div_4);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var label_1 = $.child(div_5);
	var text_5 = $.only_child(label_1, true);
	var p_2 = $.sibling(label_1, 2);
	var text_6 = $.only_child(p_2, true);
	var div_6 = $.sibling(p_2, 2);
	var input_1 = $.child(div_6);

	$.remove_input_defaults(input_1);
	$.bind_this(input_1, ($$value) => $.set(inputElement, $$value), () => $.get(inputElement));

	var button_1 = $.sibling(input_1, 2);
	var node_2 = $.child(button_1);

	IconPlus(node_2, { size: 20 });
	$.reset(button_1);
	$.reset(div_6);
	$.reset(div_5);

	var node_3 = $.sibling(div_5, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_7 = root_4();
			var h4 = $.child(div_7);
			var text_7 = $.only_child(h4, true);
			var node_4 = $.sibling(h4, 2);

			$.each(node_4, 17, () => contentFilter.activePresets, $.index, ($$anchor, presetId) => {
				const preset = $.derived(() => $.get(localizedPresets).find((p) => p.id === $.get(presetId)));
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				{
					var consequent_2 = ($$anchor) => {
						var div_8 = root_2();
						var div_9 = $.child(div_8);
						var text_8 = $.only_child(div_9);
						var div_10 = $.sibling(div_9, 2);

						$.each(div_10, 21, () => getPresetKeywords($.get(preset)), $.index, ($$anchor, keyword) => {
							var span_1 = root_1();
							var text_9 = $.only_child(span_1, true);

							$.template_effect(() => $.set_text(text_9, $.get(keyword)));
							$.append($$anchor, span_1);
						});

						$.reset(div_10);
						$.reset(div_8);
						$.template_effect(() => $.set_text(text_8, `${$.get(preset).label ?? ''}:`));
						$.append($$anchor, div_8);
					};

					$.if(node_5, ($$render) => {
						if ($.get(preset)) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_3);
			});

			var node_6 = $.sibling(node_4, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_11 = root_2();
					var div_12 = $.child(div_11);
					var text_10 = $.only_child(div_12);
					var div_13 = $.sibling(div_12, 2);

					$.each(div_13, 21, () => $.get(customKeywords), $.index, ($$anchor, keyword) => {
						var span_2 = root_3();
						var text_11 = $.child(span_2);
						var button_2 = $.sibling(text_11);
						var node_7 = $.child(button_2);

						IconX(node_7, { size: 16 });
						$.reset(button_2);
						$.reset(span_2);

						$.template_effect(() => {
							$.set_text(text_11, `${$.get(keyword) ?? ''} `);
							$.set_attribute(button_2, 'aria-label', `Remove ${$.get(keyword) ?? ''}`);
						});

						$.delegated('click', button_2, () => contentFilter.removeKeyword($.get(keyword)));
						$.append($$anchor, span_2);
					});

					$.reset(div_13);
					$.reset(div_11);
					$.template_effect(($0) => $.set_text(text_10, `${$0 ?? ''}:`), [() => s("settings.contentFilter.customKeywords") || "Custom"]);
					$.append($$anchor, div_11);
				};

				$.if(node_6, ($$render) => {
					if ($.get(customKeywords).length > 0) $$render(consequent_3);
				});
			}

			var button_3 = $.sibling(node_6, 2);
			var text_12 = $.only_child(button_3, true);

			$.reset(div_7);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_7, $0);
					$.set_text(text_12, $1);
				},
				[
					() => s("settings.contentFilter.activeFilters") || "Active Filters",
					() => s("settings.contentFilter.clearAll") || "Clear all filters"
				]
			);

			$.delegated('click', button_3, () => contentFilter.clearKeywords());
			$.append($$anchor, div_7);
		};

		$.if(node_3, ($$render) => {
			if (contentFilter.keywords.length > 0) $$render(consequent_4);
		});
	}

	var fieldset = $.sibling(node_3, 2);
	var legend = $.child(fieldset);
	var text_13 = $.only_child(legend, true);
	var p_3 = $.sibling(legend, 2);
	var text_14 = $.only_child(p_3, true);
	var div_14 = $.sibling(p_3, 2);
	var label_2 = $.child(div_14);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);

	var div_15 = $.sibling(input_2, 2);
	var span_3 = $.child(div_15);
	var text_15 = $.only_child(span_3, true);
	var span_4 = $.sibling(span_3, 2);
	var text_16 = $.only_child(span_4, true);

	$.reset(div_15);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.child(label_3);

	$.remove_input_defaults(input_3);

	var div_16 = $.sibling(input_3, 2);
	var span_5 = $.child(div_16);
	var text_17 = $.only_child(span_5, true);
	var span_6 = $.sibling(span_5, 2);
	var text_18 = $.only_child(span_6, true);

	$.reset(div_16);
	$.reset(label_3);
	$.reset(div_14);
	$.reset(fieldset);

	var div_17 = $.sibling(fieldset, 2);
	var node_8 = $.child(div_17);

	{
		let $0 = $.derived(() => [
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
		]);

		let $1 = $.derived(() => s("settings.contentFilter.scope.label") || "Filter Scope");

		Select(node_8, {
			get value() {
				return contentFilter.filterScope;
			},

			get options() {
				return $.get($0);
			},

			get label() {
				return $.get($1);
			},
			onChange: (value) => contentFilter.setFilterScope(value)
		});
	}

	var p_4 = $.sibling(node_8, 2);
	var text_19 = $.only_child(p_4, true);

	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var div_19 = $.child(div_18);
	var span_7 = $.child(div_19);
	var text_20 = $.only_child(span_7, true);
	var p_5 = $.sibling(span_7, 2);
	var text_21 = $.only_child(p_5, true);

	$.reset(div_19);

	var button_4 = $.sibling(div_19, 2);
	var span_8 = $.only_child(button_4);

	$.reset(div_18);

	var div_20 = $.sibling(div_18, 2);
	var h4_1 = $.child(div_20);
	var text_22 = $.only_child(h4_1, true);
	var p_6 = $.sibling(h4_1, 2);
	var text_23 = $.only_child(p_6, true);
	var div_21 = $.sibling(p_6, 2);
	var button_5 = $.child(div_21);
	var node_9 = $.child(button_5);

	IconDownload(node_9, { size: 16 });

	var text_24 = $.sibling(node_9);

	$.reset(button_5);

	var button_6 = $.sibling(button_5, 2);
	var node_10 = $.child(button_6);

	IconUpload(node_10, { size: 16 });

	var text_25 = $.sibling(node_10);

	$.reset(button_6);
	$.bind_this(button_6, ($$value) => $.set(importButtonElement, $$value), () => $.get(importButtonElement));

	var input_4 = $.sibling(button_6, 2);

	$.bind_this(input_4, ($$value) => $.set(fileInputElement, $$value), () => $.get(fileInputElement));

	var node_11 = $.sibling(input_4, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_22 = root_6();
			var div_23 = $.child(div_22);
			var h5 = $.child(div_23);
			var text_26 = $.only_child(h5, true);
			var p_7 = $.sibling(h5, 2);
			var text_27 = $.only_child(p_7, true);
			var node_12 = $.sibling(p_7, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_24 = root_5();
					var p_8 = $.child(div_24);
					var text_28 = $.only_child(p_8);

					$.reset(div_24);
					$.template_effect(() => $.set_text(text_28, `⚠️ ${$.get(importWarning) ?? ''}`));
					$.append($$anchor, div_24);
				};

				$.if(node_12, ($$render) => {
					if ($.get(importWarning)) $$render(consequent_5);
				});
			}

			var p_9 = $.sibling(node_12, 2);
			var text_29 = $.only_child(p_9, true);
			var div_25 = $.sibling(p_9, 2);
			var button_7 = $.child(div_25);
			var text_30 = $.only_child(button_7, true);
			var button_8 = $.sibling(button_7, 2);
			var text_31 = $.only_child(button_8, true);

			$.reset(div_25);
			$.reset(div_23);
			$.reset(div_22);

			$.template_effect(
				($0, $1, $2, $3, $4) => {
					$.set_text(text_26, $0);
					$.set_text(text_27, $1);
					$.set_text(text_29, $2);
					$.set_text(text_30, $3);
					$.set_text(text_31, $4);
				},
				[
					() => s("settings.contentFilter.importConfirm.title") || "Import Settings?",
					() => s("settings.contentFilter.importConfirm.warning") || "This will replace all current filter settings.",
					() => s("settings.contentFilter.importConfirm.backup") || "Tip: Export your current settings first to create a backup.",
					() => s("common.cancel") || "Cancel",
					() => s("settings.contentFilter.importConfirm.action") || "Import"
				]
			);

			$.delegated('click', button_7, () => {
				$.set(showImportConfirm, false);

				if ($.get(fileInputElement)) $.get(fileInputElement).value = "";
			});

			$.delegated('click', button_8, confirmImport);
			$.append($$anchor, div_22);
		};

		$.if(node_11, ($$render) => {
			if ($.get(showImportConfirm)) $$render(consequent_6);
		});
	}

	$.reset(div_21);
	$.reset(div_20);

	var div_26 = $.sibling(div_20, 2);
	var button_9 = $.child(div_26);
	var text_32 = $.only_child(button_9, true);

	$.bind_this(button_9, ($$value) => $.set(resetButtonElement, $$value), () => $.get(resetButtonElement));

	var node_13 = $.sibling(button_9, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_27 = root_7();
			var div_28 = $.child(div_27);
			var p_10 = $.child(div_28);
			var text_33 = $.only_child(p_10, true);
			var div_29 = $.sibling(p_10, 2);
			var button_10 = $.child(div_29);
			var text_34 = $.only_child(button_10, true);
			var button_11 = $.sibling(button_10, 2);
			var text_35 = $.only_child(button_11, true);

			$.reset(div_29);
			$.reset(div_28);
			$.reset(div_27);

			$.template_effect(
				($0, $1, $2) => {
					$.set_text(text_33, $0);
					$.set_text(text_34, $1);
					$.set_text(text_35, $2);
				},
				[
					() => s("settings.contentFilter.resetModal.description") || "This will clear all filters and reset settings to defaults.",
					() => s("common.cancel") || "Cancel",
					() => s("common.reset") || "Reset"
				]
			);

			$.delegated('click', button_10, () => $.set(showResetConfirm, false));
			$.delegated('click', button_11, resetToDefaults);
			$.append($$anchor, div_27);
		};

		$.if(node_13, ($$render) => {
			if ($.get(showResetConfirm)) $$render(consequent_7);
		});
	}

	$.reset(div_26);
	$.reset(div);

	$.template_effect(
		(
			$0,
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11,
			$12,
			$13,
			$14,
			$15,
			$16,
			$17,
			$18,
			$19,
			$20,
			$21
		) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_3, $3);
			$.set_text(text_5, $4);
			$.set_text(text_6, $5);
			$.set_attribute(input_1, 'placeholder', $6);
			button_1.disabled = $7;
			$.set_text(text_13, $8);
			$.set_text(text_14, $9);
			$.set_checked(input_2, contentFilter.filterMode === "hide");
			$.set_text(text_15, $10);
			$.set_text(text_16, $11);
			$.set_checked(input_3, contentFilter.filterMode === "blur");
			$.set_text(text_17, $12);
			$.set_text(text_18, $13);
			$.set_text(text_19, $14);
			$.set_text(text_20, $15);
			$.set_text(text_21, $16);
			$.set_attribute(button_4, 'aria-checked', contentFilter.showFilteredCount);

			$.set_class(button_4, 1, `relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${contentFilter.showFilteredCount
				? 'bg-blue-600 dark:bg-blue-500'
				: 'bg-gray-200 dark:bg-gray-700'}`);

			$.set_class(span_8, 1, `inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${contentFilter.showFilteredCount
				? 'ltr:translate-x-6 rtl:-translate-x-6'
				: 'ltr:translate-x-0.5 rtl:-translate-x-0.5'}`);

			$.set_text(text_22, $17);
			$.set_text(text_23, $18);
			$.set_text(text_24, ` ${$19 ?? ''}`);
			$.set_text(text_25, ` ${$20 ?? ''}`);
			$.set_text(text_32, $21);
		},
		[
			() => s("settings.contentFilter.tab.description") || "Customize your news feed by filtering out topics you prefer not to see. Use presets for common filters or create your own custom keywords.",
			() => s("settings.contentFilter.presets.label") || "Filter Presets",
			() => s("settings.contentFilter.contribute") || "Add more filters",
			() => s("settings.contentFilter.presets.description") || "Select one or more preset filters to quickly hide common topics",
			() => s("settings.contentFilter.keywords.label") || "Custom Keywords",
			() => s("settings.contentFilter.keywords.description") || "Add your own keywords to filter, separated by commas",
			() => s("settings.contentFilter.keywords.placeholder") || "e.g., celebrity name, topic",
			() => !$.get(newKeyword).trim(),
			() => s("settings.contentFilter.mode.label") || "Filter Mode",
			() => s("settings.contentFilter.mode.description") || "Choose how filtered content is handled",
			() => s("settings.contentFilter.mode.hide") || "Hide completely",
			() => s("settings.contentFilter.mode.hideDescription") || "Filtered stories are removed from view",
			() => s("settings.contentFilter.mode.blur") || "Blur with warning",
			() => s("settings.contentFilter.mode.blurDescription") || "Stories are blurred and can be revealed on click",
			() => s("settings.contentFilter.scope.description") || "Choose which parts of stories to check for keywords",
			() => s("settings.contentFilter.showCount.label") || "Show Filtered Count",
			() => s("settings.contentFilter.showCount.description") || "Display number of filtered stories in each category",
			() => s("settings.contentFilter.exportImport.title") || "Backup & Restore",
			() => s("settings.contentFilter.exportImport.description") || "Export your filter settings to a file or import from a previous backup",
			() => s("settings.contentFilter.export") || "Export Settings",
			() => s("settings.contentFilter.import") || "Import Settings",
			() => s("settings.contentFilter.reset") || "Reset to Defaults"
		]
	);

	$.delegated('keydown', input_1, handleKeydown);
	$.bind_value(input_1, () => $.get(newKeyword), ($$value) => $.set(newKeyword, $$value));
	$.delegated('click', button_1, addKeyword);
	$.delegated('change', input_2, () => contentFilter.setFilterMode("hide"));
	$.delegated('change', input_3, () => contentFilter.setFilterMode("blur"));
	$.delegated('click', button_4, () => contentFilter.setShowFilteredCount(!contentFilter.showFilteredCount));
	$.delegated('click', button_5, exportConfig);
	$.delegated('click', button_6, () => $.get(fileInputElement)?.click());
	$.delegated('change', input_4, handleFileSelect);
	$.delegated('click', button_9, () => $.set(showResetConfirm, !$.get(showResetConfirm)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown', 'change']);