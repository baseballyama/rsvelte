import * as $ from 'svelte/internal/server';
import { IconInfoCircle, IconSparkles } from '@tabler/icons-svelte';
import { getContext } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import { categorySettings, readingLevelSettings } from '$lib/data/settings.svelte';
import DataLanguageSelector from './snippets/DataLanguageSelector.svelte';
import LanguageSelector from './snippets/LanguageSelector.svelte';

export default function SettingsLanguage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Get session from context to check subscription
		const session = getContext('session');

		const isSubscriber = $.derived(() => session?.subscription === true);

		// Reading level options for global setting
		const globalReadingLevels = [
			{
				value: 'normal',
				labelKey: 'settings.readingLevel.levels.default',
				fallback: 'Normal',
				description: 'Original text without simplification'
			},

			{
				value: 'simple',
				labelKey: 'settings.readingLevel.levels.simple',
				fallback: 'Simple',
				description: 'Clear and straightforward language (B1 level)'
			},

			{
				value: 'very-simple',
				labelKey: 'settings.readingLevel.levels.verySimple',
				fallback: 'Very Simple',
				description: 'Basic vocabulary and short sentences (A2 level)'
			}
		];

		// Reading level options for per-category (includes "Use Global" option)
		const categoryReadingLevels = [
			{
				value: 'use-global',
				labelKey: 'settings.readingLevel.levels.useGlobal',
				fallback: 'Global',
				description: 'Use the global reading level setting'
			},

			{
				value: 'normal',
				labelKey: 'settings.readingLevel.levels.default',
				fallback: 'Normal',
				description: 'Original text without simplification'
			},

			{
				value: 'simple',
				labelKey: 'settings.readingLevel.levels.simple',
				fallback: 'Simple',
				description: 'Clear and straightforward language (B1 level)'
			},

			{
				value: 'very-simple',
				labelKey: 'settings.readingLevel.levels.verySimple',
				fallback: 'Very Simple',
				description: 'Basic vocabulary and short sentences (A2 level)'
			}
		];

		// Categories that don't support simplification
		const unsimplifiableCategories = ['onthisday'];

		// Get all enabled categories sorted by order (excluding unsimplifiable ones)
		const enabledCategories = $.derived(() => {
			const enabled = categorySettings.enabled;
			const order = categorySettings.order;
			const allCats = categorySettings.allCategories;

			// Filter to only enabled categories, excluding unsimplifiable ones
			const enabledCats = allCats.filter((cat) => enabled.includes(cat.id) && !unsimplifiableCategories.includes(cat.id));

			// Sort by order
			return enabledCats.sort((a, b) => {
				const aIndex = order.indexOf(a.id);
				const bIndex = order.indexOf(b.id);

				if (aIndex === -1) return 1;
				if (bIndex === -1) return -1;

				return aIndex - bIndex;
			});
		});

		// Get the current override for a category (or 'use-global' if no override)
		function getCategoryOverride(categoryId) {
			const override = readingLevelSettings.getCategoryOverride(categoryId);

			return override || 'use-global';
		}

		// Set the reading level for a category
		function setCategoryLevel(categoryId, level) {
			readingLevelSettings.setForCategory(categoryId, level);
		}

		// Count of categories with overrides
		const overrideCount = $.derived(() => readingLevelSettings.getCategoriesWithOverrides().length);

		// Check if any simplification is enabled (global or any override)
		const hasAnySimplification = $.derived(() => readingLevelSettings.global !== 'normal' || overrideCount() > 0);

		// Get display label for a reading level
		function getLevelLabel(level) {
			switch (level) {
				case 'very-simple':
					return s('story.simplify.verySimple') || 'Very Simple';

				case 'simple':
					return s('story.simplify.simple') || 'Simple';

				default:
					return s('story.simplify.normal') || 'Normal';
			}
		}

		$$renderer.push(`<div class="space-y-8"><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.subsections.localization") || "Language & Region")}</h3> <div class="space-y-4 ps-2">`);
		LanguageSelector($$renderer, { showTooltip: true, showLoadingSpinner: true });
		$$renderer.push(`<!----> `);

		DataLanguageSelector($$renderer, {
			showTooltip: true,
			showLoadingSpinner: true,
			showTranslateLink: true
		});

		$$renderer.push(`<!----></div></div> `);

		if (isSubscriber()) {
			$$renderer.push(`<!--[0--><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.readingLevel.title") || "Reading Level")}</h3> <div class="ps-2 space-y-6"><p class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s('settings.readingLevel.tab.description') || 'Set a default reading level for all stories. You can also customize the level for specific categories.')}</p> <div><div class="flex items-center justify-between mb-2"><h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s('settings.readingLevel.global.label') || 'Default Reading Level')}</h4> `);

			if (hasAnySimplification()) {
				$$renderer.push(`<!--[0--><button class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">${$.escape(s('settings.readingLevel.resetAll') || 'Reset all')}</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">${$.escape(s('settings.readingLevel.global.description') || 'This applies to all categories unless you set a specific level below.')}</p> <div class="flex items-center gap-2"><!--[-->`);

			const each_array = $.ensure_array_like(globalReadingLevels);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let level = each_array[$$index];

				$$renderer.push(`<button${$.attr_class(`px-4 py-2 text-sm rounded-lg transition-colors ${readingLevelSettings.global === level.value
					? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
					: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`)}${$.attr('title', level.description)}>`);

				if (level.value !== 'normal') {
					$$renderer.push('<!--[0-->');
					IconSparkles($$renderer, { size: 14, class: 'inline me-1.5 -mt-0.5' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> ${$.escape(s(level.labelKey) || level.fallback)}</button>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700"><div class="flex items-center justify-between mb-2"><h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s('settings.readingLevel.categories.label') || 'Category Overrides')}</h4> `);

			if (overrideCount() > 0) {
				$$renderer.push(`<!--[0--><button class="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">${$.escape(s('settings.readingLevel.clearOverrides') || 'Clear overrides')}</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">${$.escape(s('settings.readingLevel.categories.description') || 'Override the default level for specific categories. Categories set to "Global" will use your default setting above.')}</p> `);

			if (enabledCategories().length === 0) {
				$$renderer.push(`<!--[0--><p class="text-sm text-gray-500 dark:text-gray-400 italic">${$.escape(s('settings.readingLevel.noCategories') || 'No categories enabled. Enable categories in the Categories tab.')}</p>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="space-y-2"><!--[-->`);

				const each_array_1 = $.ensure_array_like(enabledCategories());

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let category = each_array_1[$$index_2];
					const currentOverride = getCategoryOverride(category.id);
					const effectiveLevel = readingLevelSettings.getForCategory(category.id);

					$$renderer.push(`<div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"><div class="flex items-center gap-2"><span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">${$.escape(category.name)}</span> `);

					if (effectiveLevel && effectiveLevel !== 'normal') {
						$$renderer.push(`<!--[0--><span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">`);
						IconSparkles($$renderer, { size: 12, class: 'me-1' });
						$$renderer.push(`<!----> ${$.escape(getLevelLabel(effectiveLevel))} `);

						if (currentOverride === 'use-global') {
							$$renderer.push(`<!--[0--><span class="ms-1 opacity-70">(${$.escape(s('settings.readingLevel.fromGlobal') || 'global')})</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="flex items-center gap-1"><!--[-->`);

					const each_array_2 = $.ensure_array_like(categoryReadingLevels);

					for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
						let level = each_array_2[$$index_1];

						$$renderer.push(`<button${$.attr_class(`px-2.5 py-1 text-xs rounded-md transition-colors ${currentOverride === level.value
							? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
							: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`)}${$.attr('title', level.description)}>${$.escape(s(level.labelKey) || level.fallback)}</button>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700"><div class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">`);
			IconInfoCircle($$renderer, { size: 18, class: 'shrink-0 mt-0.5' });
			$$renderer.push(`<!----> <div class="space-y-2"><p>${$.escape(s('settings.readingLevel.info.howItWorks') || 'When you open a story, the content will be automatically simplified to your chosen reading level. You can still manually change the level for any story.')}</p> <p><strong>${$.escape(s('story.simplify.simple') || 'Simple')}</strong>: ${$.escape(s('settings.readingLevel.info.simpleDescription') || 'Clear language at an intermediate level (B1). Good for general readers.')}</p> <p><strong>${$.escape(s('story.simplify.verySimple') || 'Very Simple')}</strong>: ${$.escape(s('settings.readingLevel.info.verySimpleDescription') || 'Basic vocabulary and short sentences (A2). Ideal for language learners.')}</p></div></div></div></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.readingLevel.title") || "Reading Level")}</h3> <div class="ps-2"><div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"><p class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s("settings.readingLevel.subscriberOnly") || "Reading level simplification is available for Kagi subscribers. Upgrade to automatically simplify articles to your preferred reading level.")}</p> <a href="https://kagi.com/settings?p=billing" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">${$.escape(s("settings.readingLevel.upgrade") || "Upgrade to Kagi")}</a></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}