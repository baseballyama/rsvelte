import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconInfoCircle, IconX } from '@tabler/icons-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import Select from '$lib/components/Select.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { SUPPORTED_LANGUAGES } from '$lib/constants/languages.js';
import { languageSettings, settings } from '$lib/data/settings.svelte.js';
import { dataReloadService } from '$lib/services/dataService.js';
import { detectUserLanguage } from '$lib/utils/languageDetection.js';

var root = $.from_html(`<button type="button" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"><!></button>`);
var root_1 = $.from_html(`<div class="flex items-center space-x-1 mb-1"><label for="data-language-select" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <!></div>`);
var root_2 = $.from_html(`<div class="absolute right-3 top-2.5"><div class="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full"></div></div>`);
var root_3 = $.from_html(`<button type="button" disabled="" class="text-gray-300 dark:text-gray-600 cursor-not-allowed" aria-label="Cannot remove main language"><!></button>`);
var root_4 = $.from_html(`<button type="button" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" aria-label="Remove"><!></button>`);
var root_5 = $.from_html(`<li class="flex items-center gap-2 rounded bg-white dark:bg-gray-900 px-3 py-2 border border-gray-200 dark:border-gray-700"><span class="flex-1 text-sm text-gray-700 dark:text-gray-300"> </span> <!></li>`);
var root_6 = $.from_html(`<div class="flex gap-2 mt-2"><!></div>`);
var root_7 = $.from_html(`<p class="text-xs text-gray-500 dark:text-gray-400 mt-2"> </p>`);
var root_8 = $.from_html(`<p class="text-xs text-gray-600 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"><!></p>`);
var root_9 = $.from_html(`<div class="mt-4 space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4"><div class="space-y-3"><div><!> <p class="text-xs text-gray-500 dark:text-gray-400 mt-1"> </p></div> <div><div class="flex items-center justify-between mb-2"><h4 class="text-sm font-medium text-gray-700 dark:text-gray-300"> </h4> <!></div> <ul class="space-y-2"></ul> <!> <!></div></div></div>`);
var root_10 = $.from_html(`<div class="mt-1 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400"><a href="https://kagi.com/translate" target="_blank" class="flex items-center hover:text-gray-700 dark:hover:text-gray-300"><span> </span> <img src="/svg/translate.svg" alt="Kagi Translate" class="ms-1 h-3 w-3"/></a></div>`);
var root_11 = $.from_html(`<div class="space-y-2"><!> <div class="relative"><!> <!></div> <!> <!></div>`);

export default function DataLanguageSelector($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let showTooltip = $.prop($$props, 'showTooltip', 3, false),
		showLoadingSpinner = $.prop($$props, 'showLoadingSpinner', 3, false),
		showTranslateLink = $.prop($$props, 'showTranslateLink', 3, false);

	// Data Language options - only show default, source, and custom
	const dataLanguageOptions = $.derived(() => [
		{
			value: 'default',
			label: s('settings.language.default') || 'Default'
		},

		{
			value: 'source',
			label: s('settings.language.source') || 'Source'
		},

		{
			value: 'custom',
			label: s('settings.language.custom') || 'Custom'
		}
	]);

	// Available languages for custom preferences (exclude special values)
	const availableLanguages = $.derived(() => SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'default' && lang.code !== 'source' && lang.code !== 'custom').map((lang) => ({ value: lang.code, label: lang.name })));

	// Show custom language preferences UI when custom is selected
	const showCustomPreferences = $.derived(() => languageSettings.data === 'custom');

	// Loading state
	let isLoading = $.state(false);

	// Get the browser's detected language name for the tooltip
	const browserLanguageName = $.derived(() => {
		if (!browser) return 'English';

		const detectedLangCode = detectUserLanguage();
		const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === detectedLangCode);

		if (!langInfo) return 'English';

		// Extract English name from parentheses if present
		const match = langInfo.name.match(/\(([^)]+)\)/);

		if (match) {
			return match[1];
		}

		// For languages without parentheses, return as-is
		return langInfo.name;
	});

	// Handle data language change
	async function handleDataLanguageChange(newLanguage) {
		languageSettings.data = newLanguage;
		settings.dataLanguage.save();

		if (showLoadingSpinner()) {
			$.set(isLoading, true);

			try {
				// Reload all data for the new data language
				await dataReloadService.reloadData();
			} finally {
				$.set(isLoading, false);
			}
		}
	}

	// Language preferences management
	function addLanguagePreference(langCode) {
		const currentPrefs = languageSettings.contentLanguages;

		if (!currentPrefs.includes(langCode)) {
			languageSettings.contentLanguages = [...currentPrefs, langCode];
			triggerReloadIfNeeded();
		}
	}

	function removeLanguagePreference(langCode) {
		const currentPrefs = languageSettings.contentLanguages;

		languageSettings.contentLanguages = currentPrefs.filter((lang) => lang !== langCode);
		triggerReloadIfNeeded();
	}

	async function triggerReloadIfNeeded() {
		if (showLoadingSpinner()) {
			$.set(isLoading, true);

			try {
				await dataReloadService.reloadData();
			} finally {
				$.set(isLoading, false);
			}
		}
	}

	// Get languages not yet in "languages I speak" (exclude main language and already added ones)
	const availableToAdd = $.derived(() => $.get(availableLanguages).filter((lang) => !languageSettings.contentLanguages.includes(lang.value)));

	// Track selected language for adding
	let selectedLanguageToAdd = $.state('');

	var div = root_11();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var label = $.child(div_1);
			var text = $.only_child(label, true);
			var node_1 = $.sibling(label, 2);

			{
				let $0 = $.derived(() => s("settings.dataLanguage.tooltip", { browserLang: $.get(browserLanguageName) }) || `Default shows most categories in your browser's language (${$.get(browserLanguageName)}), but country categories in their local language. Select a specific language to view all content in that language.`);

				Tooltip(node_1, {
					get text() {
						return $.get($0);
					},
					position: 'bottom',
					children: ($$anchor, $$slotProps) => {
						var button = root();
						var node_2 = $.child(button);

						IconInfoCircle(node_2, { size: 14, stroke: 1.5 });
						$.reset(button);
						$.append($$anchor, button);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_1);
			$.template_effect(($0) => $.set_text(text, $0), [() => s("settings.dataLanguage.label") || "Content Language"]);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (showTooltip()) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_3 = $.child(div_2);

	{
		let $0 = $.derived(() => showTooltip() ? "data-language-select" : undefined);

		let $1 = $.derived(() => !showTooltip()
			? s("settings.dataLanguage.label") || "Content Language"
			: undefined);

		Select(node_3, {
			get id() {
				return $.get($0);
			},

			get value() {
				return languageSettings.data;
			},

			get options() {
				return $.get(dataLanguageOptions);
			},

			get label() {
				return $.get($1);
			},

			get hideLabel() {
				return showTooltip();
			},
			onChange: handleDataLanguageChange
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_2();

			$.append($$anchor, div_3);
		};

		$.if(node_4, ($$render) => {
			if (showLoadingSpinner() && $.get(isLoading)) $$render(consequent_1);
		});
	}

	$.reset(div_2);

	var node_5 = $.sibling(div_2, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_4 = root_9();
			var div_5 = $.child(div_4);
			var div_6 = $.child(div_5);
			var node_6 = $.child(div_6);

			{
				let $0 = $.derived(() => s("settings.language.mainLanguage") || "Main Language");
				let $1 = $.derived(() => languageSettings.contentLanguages[0] || 'en');

				Select(node_6, {
					get label() {
						return $.get($0);
					},

					get value() {
						return $.get($1);
					},

					get options() {
						return $.get(availableLanguages);
					},

					onChange: (value) => {
						const current = languageSettings.contentLanguages;
						const newMainLanguage = value;
						const oldMainLanguage = current[0];

						// Check if the new main language is already in the list
						const existingIndex = current.indexOf(newMainLanguage);

						if (existingIndex > 0) {
							// Swap: new main language becomes first, old main language takes its place
							const updated = [...current];

							updated[0] = newMainLanguage;
							updated[existingIndex] = oldMainLanguage;
							languageSettings.contentLanguages = updated;
						} else {
							// New language not in list, just replace the main language
							languageSettings.contentLanguages = [newMainLanguage, ...current.slice(1)];
						}

						triggerReloadIfNeeded();
					},
					className: 'w-full',
					height: 'h-10'
				});
			}

			var p = $.sibling(node_6, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var div_8 = $.child(div_7);
			var h4 = $.child(div_8);
			var text_2 = $.only_child(h4, true);
			var node_7 = $.sibling(h4, 2);

			{
				let $0 = $.derived(() => s("settings.language.languagesISpeakTooltip") || "Select all languages you can read. Articles in these languages will be shown in their original form.");

				Tooltip(node_7, {
					get text() {
						return $.get($0);
					},
					position: 'left',
					children: ($$anchor, $$slotProps) => {
						var button_1 = root();
						var node_8 = $.child(button_1);

						IconInfoCircle(node_8, { size: 14, stroke: 1.5 });
						$.reset(button_1);
						$.append($$anchor, button_1);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_8);

			var ul = $.sibling(div_8, 2);

			$.each(ul, 21, () => languageSettings.contentLanguages, $.index, ($$anchor, lang, index) => {
				const langInfo = $.derived(() => $.get(availableLanguages).find((l) => l.value === $.get(lang)));
				const isMainLanguage = $.derived(() => index === 0);
				var li = root_5();
				var span = $.child(li);
				var text_3 = $.only_child(span, true);
				var node_9 = $.sibling(span, 2);

				{
					var consequent_2 = ($$anchor) => {
						{
							let $0 = $.derived(() => s("settings.language.cannotRemoveMain") || "Cannot remove your main language");

							Tooltip($$anchor, {
								get text() {
									return $.get($0);
								},
								position: 'left',
								children: ($$anchor, $$slotProps) => {
									var button_2 = root_3();
									var node_10 = $.child(button_2);

									IconX(node_10, { size: 16, stroke: 1.5 });
									$.reset(button_2);
									$.append($$anchor, button_2);
								},
								$$slots: { default: true }
							});
						}
					};

					var alternate = ($$anchor) => {
						var button_3 = root_4();
						var node_11 = $.child(button_3);

						IconX(node_11, { size: 16, stroke: 1.5 });
						$.reset(button_3);
						$.delegated('click', button_3, () => removeLanguagePreference($.get(lang)));
						$.append($$anchor, button_3);
					};

					$.if(node_9, ($$render) => {
						if ($.get(isMainLanguage)) $$render(consequent_2); else $$render(alternate, -1);
					});
				}

				$.reset(li);
				$.template_effect(() => $.set_text(text_3, $.get(langInfo)?.label || $.get(lang)));
				$.append($$anchor, li);
			});

			$.reset(ul);

			var node_12 = $.sibling(ul, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_9 = root_6();
					var node_13 = $.child(div_9);

					{
						let $0 = $.derived(() => [
							{
								value: '',
								label: s("settings.language.selectLanguage") || "Select a language..."
							},
							...$.get(availableToAdd)
						]);

						Select(node_13, {
							get value() {
								return $.get(selectedLanguageToAdd);
							},

							get options() {
								return $.get($0);
							},

							onChange: (value) => {
								$.set(selectedLanguageToAdd, value, true);

								if (value) {
									addLanguagePreference(value);
									$.set(selectedLanguageToAdd, '');
								}
							},
							className: 'flex-1 min-w-[240px]',
							height: 'h-10'
						});
					}

					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				var alternate_1 = ($$anchor) => {
					var p_1 = root_7();
					var text_4 = $.only_child(p_1, true);

					$.template_effect(($0) => $.set_text(text_4, $0), [
						() => s("settings.language.allLanguagesAdded") || "All available languages have been added."
					]);

					$.append($$anchor, p_1);
				};

				$.if(node_12, ($$render) => {
					if ($.get(availableToAdd).length > 0) $$render(consequent_3); else $$render(alternate_1, -1);
				});
			}

			var node_14 = $.sibling(node_12, 2);

			{
				var consequent_6 = ($$anchor) => {
					const validPrefs = $.derived(() => languageSettings.contentLanguages.filter((lang) => lang !== 'default' && lang !== 'source' && lang !== 'custom'));
					const mainLang = $.derived(() => $.get(validPrefs)[0]);
					const additionalLangs = $.derived(() => $.get(validPrefs).slice(1));
					const mainLangInfo = $.derived(() => $.get(availableLanguages).find((l) => l.value === $.get(mainLang)));
					const mainLangName = $.derived(() => $.get(mainLangInfo)?.label.replace(/\s*\([^)]*\)\s*$/, '').trim() || 'English');
					var p_2 = root_8();
					var node_15 = $.child(p_2);

					{
						var consequent_4 = ($$anchor) => {
							var text_5 = $.text();

							$.template_effect(($0) => $.set_text(text_5, $0), [
								() => s("settings.language.customExplanationMainOnly", { mainLang: $.get(mainLangName) }) || `Articles in ${$.get(mainLangName)} will be shown in the original language, all others translated into ${$.get(mainLangName)}.`
							]);

							$.append($$anchor, text_5);
						};

						var consequent_5 = ($$anchor) => {
							const additionalLang = $.derived(() => $.get(availableLanguages).find((l) => l.value === $.get(additionalLangs)[0])?.label.replace(/\s*\([^)]*\)\s*$/, '').trim() || $.get(additionalLangs)[0]);
							var text_6 = $.text();

							$.template_effect(($0) => $.set_text(text_6, $0), [
								() => s("settings.language.customExplanationTwoLangs", {
									mainLang: $.get(mainLangName),
									additionalLang: $.get(additionalLang)
								}) || `Articles in ${$.get(mainLangName)} or ${$.get(additionalLang)} will be shown in the original language, all others translated into ${$.get(mainLangName)}.`
							]);

							$.append($$anchor, text_6);
						};

						var alternate_2 = ($$anchor) => {
							const allSpeakNames = $.derived(() => $.get(validPrefs).map((lang) => {
								const info = $.get(availableLanguages).find((l) => l.value === lang);

								return info?.label.replace(/\s*\([^)]*\)\s*$/, '').trim() || lang;
							}));

							const lastLang = $.derived(() => $.get(allSpeakNames)[$.get(allSpeakNames).length - 1]);
							const otherLangs = $.derived(() => $.get(allSpeakNames).slice(0, -1).join(', '));
							var text_7 = $.text();

							$.template_effect(($0) => $.set_text(text_7, $0), [
								() => s("settings.language.customExplanationMultipleLangs", {
									languages: $.get(otherLangs),
									lastLang: $.get(lastLang),
									mainLang: $.get(mainLangName)
								}) || `Articles in ${$.get(otherLangs)}, or ${$.get(lastLang)} will be shown in the original language, all others translated into ${$.get(mainLangName)}.`
							]);

							$.append($$anchor, text_7);
						};

						$.if(node_15, ($$render) => {
							if ($.get(additionalLangs).length === 0) $$render(consequent_4); else if ($.get(additionalLangs).length === 1) $$render(consequent_5, 1); else $$render(alternate_2, -1);
						});
					}

					$.reset(p_2);
					$.append($$anchor, p_2);
				};

				$.if(node_14, ($$render) => {
					if (languageSettings.contentLanguages.length > 0) $$render(consequent_6);
				});
			}

			$.reset(div_7);
			$.reset(div_5);
			$.reset(div_4);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_1, $0);
					$.set_text(text_2, $1);
				},
				[
					() => s("settings.language.mainLanguageHelp") || "Articles will be translated into this language when not in a language you speak.",
					() => s("settings.language.languagesISpeak") || "Languages I Speak"
				]
			);

			$.append($$anchor, div_4);
		};

		$.if(node_5, ($$render) => {
			if ($.get(showCustomPreferences)) $$render(consequent_7);
		});
	}

	var node_16 = $.sibling(node_5, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_10 = root_10();
			var a = $.child(div_10);
			var span_1 = $.child(a);
			var text_8 = $.only_child(span_1, true);

			$.next(2);
			$.reset(a);
			$.reset(div_10);

			$.template_effect(($0) => $.set_text(text_8, $0), [
				() => s("settings.language.poweredBy") || "Translated with Kagi Translate"
			]);

			$.append($$anchor, div_10);
		};

		$.if(node_16, ($$render) => {
			if (showTranslateLink()) $$render(consequent_8);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);