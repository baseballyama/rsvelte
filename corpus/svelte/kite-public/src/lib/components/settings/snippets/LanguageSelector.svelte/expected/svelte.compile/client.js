import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconInfoCircle } from '@tabler/icons-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { preloadAllLocales } from '$lib/client/storyLocalization.svelte';
import Select from '$lib/components/Select.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { SUPPORTED_LANGUAGES } from '$lib/constants/languages.js';
import { languageSettings, settings } from '$lib/data/settings.svelte.js';
import { detectUserLanguage } from '$lib/utils/languageDetection.js';

var root = $.from_html(`<button type="button" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"><!></button>`);
var root_1 = $.from_html(`<div class="flex items-center space-x-1 mb-1"><label for="ui-language-select" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <!></div>`);
var root_2 = $.from_html(`<div class="absolute right-3 top-2.5"><div class="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full"></div></div>`);
var root_3 = $.from_html(`<div class="space-y-2"><!> <div class="relative"><!> <!></div></div>`);

export default function LanguageSelector($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let showTooltip = $.prop($$props, 'showTooltip', 3, false),
		showLoadingSpinner = $.prop($$props, 'showLoadingSpinner', 3, false);

	// Language options - include "default" for browser language detection
	// Exclude "source" and "custom" as those are only for content language
	const languageOptions = $.derived(() => SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'source' && lang.code !== 'custom').map((lang) => ({
		value: lang.code,
		label: lang.code === 'default'
			? s('settings.language.default') || 'Default (Auto-detect)'
			: lang.name
	})));

	// Loading state
	let isLoading = $.state(false);

	// Get browser language name for tooltip
	const browserLanguageName = $.derived(() => {
		if (!browser) return 'English';

		// Use the existing detection logic to get the language code
		const detectedLangCode = detectUserLanguage();

		// If it returns "default", browser language is not supported
		if (detectedLangCode === 'default') {
			return navigator.language; // Show the raw browser language code
		}

		// Find the language info for the detected code
		const langInfo = SUPPORTED_LANGUAGES.find((lang) => lang.code === detectedLangCode);

		if (!langInfo) return 'English';

		// Extract the English name from parentheses if it exists
		const match = langInfo.name.match(/\(([^)]+)\)/);

		if (match) {
			// Return just the English part (e.g., "Simplified Chinese" instead of "简体中文 (Simplified Chinese)")
			return match[1];
		}

		// For languages without parentheses (like English, Spanish), return as-is
		return langInfo.name;
	});

	// Handle language change
	async function handleLanguageChange(newLanguage) {
		languageSettings.ui = newLanguage;
		settings.language.save();

		// If switching to "default", preload all locales
		if (newLanguage === 'default') {
			await preloadAllLocales();
		}

		if (showLoadingSpinner()) {
			$.set(isLoading, true);

			// UI language change only requires locale reload
			await new Promise((resolve) => setTimeout(resolve, 500));

			$.set(isLoading, false);
		}
	}

	var div = root_3();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var label = $.child(div_1);
			var text = $.only_child(label, true);
			var node_1 = $.sibling(label, 2);

			{
				let $0 = $.derived(() => s("settings.uiLanguage.tooltip", { language: $.get(browserLanguageName) }) || `Controls the language of buttons, menus, and interface text. Default sets the UI language to your browser's language (${$.get(browserLanguageName)}) automatically, but the headings inside a story to the language of that story.`);

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
			$.template_effect(($0) => $.set_text(text, $0), [() => s("settings.uiLanguage.label") || "Interface Language"]);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (showTooltip()) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_3 = $.child(div_2);

	{
		let $0 = $.derived(() => showTooltip() ? "ui-language-select" : undefined);

		let $1 = $.derived(() => !showTooltip()
			? s("settings.uiLanguage.label") || "Interface Language"
			: undefined);

		Select(node_3, {
			get id() {
				return $.get($0);
			},

			get value() {
				return languageSettings.ui;
			},

			get options() {
				return $.get(languageOptions);
			},

			get label() {
				return $.get($1);
			},

			get hideLabel() {
				return showTooltip();
			},
			onChange: handleLanguageChange
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
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}