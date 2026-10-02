import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import Select from '$lib/components/Select.svelte';
import { displaySettings, settings } from '$lib/data/settings.svelte.js';
import { experimental } from '$lib/stores/experimental.svelte.js';
import ThemeSelector from './snippets/ThemeSelector.svelte';

export default function SettingsAppearance($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Font size options for display
		const fontSizeOptions = $.derived(() => [
			{
				value: 'xs',
				label: s('settings.fontSize.xs') || 'Extra Small'
			},

			{
				value: 'small',
				label: s('settings.fontSize.small') || 'Small'
			},

			{
				value: 'normal',
				label: s('settings.fontSize.normal') || 'Normal'
			},

			{
				value: 'large',
				label: s('settings.fontSize.large') || 'Large'
			},

			{
				value: 'xl',
				label: s('settings.fontSize.xl') || 'Extra Large'
			}
		]);

		// Layout width options
		const layoutWidthOptions = $.derived(() => [
			{
				value: 'normal',
				label: s('settings.layoutWidth.normal') || 'Normal (732px)'
			},

			{
				value: 'wide',
				label: s('settings.layoutWidth.wide') || 'Wide (1024px)'
			},

			{
				value: 'full',
				label: s('settings.layoutWidth.full') || 'Full Width'
			}
		]);

		// Local state that syncs with stores
		let currentFontSize = displaySettings.fontSize;

		let currentLayoutWidth = displaySettings.layoutWidth;

		// Sync local state with stores
		// Font size change handler
		function handleFontSizeChange(newSize) {
			displaySettings.fontSize = newSize;
			settings.fontSize.save();
			currentFontSize = newSize;
		}

		function handleLayoutWidthChange(width) {
			displaySettings.layoutWidth = width;
			settings.layoutWidth.save();
			currentLayoutWidth = width;
		}

		// Toggle handlers for experimental features
		function toggleArticleIcons() {
			experimental.toggleFeature('showArticleIcons');
		}

		function toggleCategoryIcons() {
			experimental.toggleFeature('showCategoryIcons');
		}

		function toggleChaosIndex() {
			experimental.toggleFeature('showChaosIndex');
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-8"><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.subsections.display") || "Display")}</h3> <div class="space-y-4 ps-2">`);
			ThemeSelector($$renderer, {});
			$$renderer.push(`<!----> <div class="flex flex-col space-y-2">`);

			Select($$renderer, {
				options: fontSizeOptions(),
				label: s("settings.fontSize.label") || "Text Size",
				onChange: handleFontSizeChange,
				get value() {
					return currentFontSize;
				},

				set value($$value) {
					currentFontSize = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="hidden md:flex flex-col space-y-2">`);

			Select($$renderer, {
				options: layoutWidthOptions(),
				label: s("settings.layoutWidth.label") || "Layout Width",
				onChange: handleLayoutWidthChange,
				get value() {
					return currentLayoutWidth;
				},

				set value($$value) {
					currentLayoutWidth = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.layoutWidth.description") || "Choose how wide the content area should be on larger screens")}</p></div></div></div> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.subsections.visualEnhancements") || "Visual Enhancements")}</h3> <div class="space-y-3 ps-2"><div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex-1 pe-4"><label for="show-article-icons" id="label-article-icons" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.experimental.articleIcons.label") || "Show Article Icons")}</label> <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${$.escape(s("settings.experimental.articleIcons.description") || "Display emoji icons next to article titles to provide visual context.")}</p></div> <button id="show-article-icons" type="button"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', void 0, {
				'bg-blue-600': experimental.showArticleIcons,
				'bg-gray-200': !experimental.showArticleIcons,
				'dark:bg-gray-600': !experimental.showArticleIcons
			})} role="switch"${$.attr('aria-checked', experimental.showArticleIcons)} aria-labelledby="label-article-icons"><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
				'ltr:translate-x-6': experimental.showArticleIcons,
				'rtl:-translate-x-6': experimental.showArticleIcons,
				'ltr:translate-x-1': !experimental.showArticleIcons,
				'rtl:-translate-x-1': !experimental.showArticleIcons
			})}></span></button></div> <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex-1 pe-4"><label for="show-category-icons" id="label-category-icons" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.experimental.categoryIcons.label") || "Show Category Icons")}</label> <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${$.escape(s("settings.experimental.categoryIcons.description") || "Display icons next to category labels for better visual identification.")}</p></div> <button id="show-category-icons" type="button"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', void 0, {
				'bg-blue-600': experimental.showCategoryIcons,
				'bg-gray-200': !experimental.showCategoryIcons,
				'dark:bg-gray-600': !experimental.showCategoryIcons
			})} role="switch"${$.attr('aria-checked', experimental.showCategoryIcons)} aria-labelledby="label-category-icons"><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
				'ltr:translate-x-6': experimental.showCategoryIcons,
				'rtl:-translate-x-6': experimental.showCategoryIcons,
				'ltr:translate-x-1': !experimental.showCategoryIcons,
				'rtl:-translate-x-1': !experimental.showCategoryIcons
			})}></span></button></div> <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex-1 pe-4"><label for="show-chaos-index" id="label-chaos-index" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.experimental.chaosIndex.label") || "Show World Tension Index")}</label> <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${$.escape(s("settings.experimental.chaosIndex.description") || "Display a global temperature reading of world stability based on current events.")}</p></div> <button id="show-chaos-index" type="button"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', void 0, {
				'bg-blue-600': experimental.showChaosIndex,
				'bg-gray-200': !experimental.showChaosIndex,
				'dark:bg-gray-600': !experimental.showChaosIndex
			})} role="switch"${$.attr('aria-checked', experimental.showChaosIndex)} aria-labelledby="label-chaos-index"><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
				'ltr:translate-x-6': experimental.showChaosIndex,
				'rtl:-translate-x-6': experimental.showChaosIndex,
				'ltr:translate-x-1': !experimental.showChaosIndex,
				'rtl:-translate-x-1': !experimental.showChaosIndex
			})}></span></button></div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}