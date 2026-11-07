import * as $ from 'svelte/internal/server';
import { IconInfoCircle } from '@tabler/icons-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { preloadAllLocales } from '$lib/client/storyLocalization.svelte';
import Select from '$lib/components/Select.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { SUPPORTED_LANGUAGES } from '$lib/constants/languages.js';
import { languageSettings, settings } from '$lib/data/settings.svelte.js';
import { detectUserLanguage } from '$lib/utils/languageDetection.js';

export default function LanguageSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let { showTooltip = false, showLoadingSpinner = false } = $$props;

		// Language options - include "default" for browser language detection
		// Exclude "source" and "custom" as those are only for content language
		const languageOptions = $.derived(() => SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'source' && lang.code !== 'custom').map((lang) => ({
			value: lang.code,
			label: lang.code === 'default'
				? s('settings.language.default') || 'Default (Auto-detect)'
				: lang.name
		})));

		// Loading state
		let isLoading = false;

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

			if (showLoadingSpinner) {
				isLoading = true;

				// UI language change only requires locale reload
				await new Promise((resolve) => setTimeout(resolve, 500));

				isLoading = false;
			}
		}

		$$renderer.push(`<div class="space-y-2">`);

		if (showTooltip) {
			$$renderer.push(`<!--[0--><div class="flex items-center space-x-1 mb-1"><label for="ui-language-select" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.uiLanguage.label") || "Interface Language")}</label> `);

			Tooltip($$renderer, {
				text: s("settings.uiLanguage.tooltip", { language: browserLanguageName() }) || `Controls the language of buttons, menus, and interface text. Default sets the UI language to your browser's language (${browserLanguageName()}) automatically, but the headings inside a story to the language of that story.`,
				position: 'bottom',
				children: ($$renderer) => {
					$$renderer.push(`<button type="button" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">`);
					IconInfoCircle($$renderer, { size: 14, stroke: 1.5 });
					$$renderer.push(`<!----></button>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="relative">`);

		Select($$renderer, {
			id: showTooltip ? "ui-language-select" : undefined,
			value: languageSettings.ui,
			options: languageOptions(),
			label: !showTooltip
				? s("settings.uiLanguage.label") || "Interface Language"
				: undefined,
			hideLabel: showTooltip,
			onChange: handleLanguageChange
		});

		$$renderer.push(`<!----> `);

		if (showLoadingSpinner && isLoading) {
			$$renderer.push(`<!--[0--><div class="absolute right-3 top-2.5"><div class="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full"></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}