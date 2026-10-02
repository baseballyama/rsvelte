import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { experimental } from '$lib/stores/experimental.svelte.js';

export default function SettingsExperimental($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Toggle handlers
		function toggleArticleIcons() {
			experimental.toggleFeature('showArticleIcons');
		}

		function toggleCategoryIcons() {
			experimental.toggleFeature('showCategoryIcons');
		}

		function toggleDisableCategorySwipe() {
			experimental.toggleFeature('disableCategorySwipe');
		}

		function toggleChaosIndex() {
			experimental.toggleFeature('showChaosIndex');
		}

		$$renderer.push(`<div class="space-y-6"><p class="mb-6 text-sm text-gray-600 dark:text-gray-400">⚠️ <span class="ms-1">${$.escape(s("settings.experimental.warning") || "These features are experimental and may change or be removed in future versions.")}</span></p> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><div class="mb-2 flex items-center justify-between"><label for="show-article-icons" id="label-article-icons" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.experimental.articleIcons.label") || "Show Article Icons")}</label> <button id="show-article-icons" type="button"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition', void 0, {
			'bg-blue-600': experimental.showArticleIcons,
			'bg-gray-200': !experimental.showArticleIcons,
			'dark:bg-gray-600': !experimental.showArticleIcons
		})} role="switch"${$.attr('aria-checked', experimental.showArticleIcons)} aria-labelledby="label-article-icons"><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
			'ltr:translate-x-6': experimental.showArticleIcons,
			'rtl:-translate-x-6': experimental.showArticleIcons,
			'ltr:translate-x-1': !experimental.showArticleIcons,
			'rtl:-translate-x-1': !experimental.showArticleIcons
		})}></span></button></div> <p class="text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.experimental.articleIcons.description") || "Display emoji icons next to article titles to provide visual context.")}</p></div> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><div class="mb-2 flex items-center justify-between"><label for="show-category-icons" id="label-category-icons" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.experimental.categoryIcons.label") || "Show Category Icons")}</label> <button id="show-category-icons" type="button"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition', void 0, {
			'bg-blue-600': experimental.showCategoryIcons,
			'bg-gray-200': !experimental.showCategoryIcons,
			'dark:bg-gray-600': !experimental.showCategoryIcons
		})} role="switch"${$.attr('aria-checked', experimental.showCategoryIcons)} aria-labelledby="label-category-icons"><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
			'ltr:translate-x-6': experimental.showCategoryIcons,
			'rtl:-translate-x-6': experimental.showCategoryIcons,
			'ltr:translate-x-1': !experimental.showCategoryIcons,
			'rtl:-translate-x-1': !experimental.showCategoryIcons
		})}></span></button></div> <p class="text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.experimental.categoryIcons.description") || "Display icons next to category labels for better visual identification.")}</p></div> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><div class="mb-2 flex items-center justify-between"><label for="disable-category-swipe" id="label-disable-swipe" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.experimental.disableCategorySwipe.label") || "Disable horizontal category swiping")}</label> <button id="disable-category-swipe" type="button"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition', void 0, {
			'bg-blue-600': experimental.disableCategorySwipe,
			'bg-gray-200': !experimental.disableCategorySwipe,
			'dark:bg-gray-600': !experimental.disableCategorySwipe
		})} role="switch"${$.attr('aria-checked', experimental.disableCategorySwipe)} aria-labelledby="label-disable-swipe"><span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
			'ltr:translate-x-6': experimental.disableCategorySwipe,
			'rtl:-translate-x-6': experimental.disableCategorySwipe,
			'ltr:translate-x-1': !experimental.disableCategorySwipe,
			'rtl:-translate-x-1': !experimental.disableCategorySwipe
		})}></span></button></div> <p class="text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.experimental.disableCategorySwipe.description") || "When enabled, horizontal swiping to change categories on mobile devices will be disabled.")}</p></div> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><div class="mb-2 flex items-center justify-between"><label for="show-chaos-index" id="label-chaos-index" class="text-sm font-medium text-gray-700 dark:text-gray-300">${$.escape(s("settings.experimental.chaosIndex.label") || "Show World Tension Index")}</label> <button id="show-chaos-index" type="button"${$.attr_class('focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition', void 0, {
			'bg-blue-600': experimental.showChaosIndex,
			'bg-gray-200': !experimental.showChaosIndex,
			'dark:bg-gray-600': !experimental.showChaosIndex
		})} role="switch"${$.attr('aria-checked', experimental.showChaosIndex)} aria-labelledby="label-chaos-index"><span class="sr-only">${$.escape(s("settings.experimental.chaosIndex.label") || "Show World Tension Index")}</span> <span${$.attr_class('inline-block h-4 w-4 transform rounded-full bg-white transition', void 0, {
			'ltr:translate-x-6': experimental.showChaosIndex,
			'rtl:-translate-x-6': experimental.showChaosIndex,
			'ltr:translate-x-1': !experimental.showChaosIndex,
			'rtl:-translate-x-1': !experimental.showChaosIndex
		})}></span></button></div> <p class="text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.experimental.chaosIndex.description") || "Display a global temperature reading of world stability based on current events.")}</p></div></div>`);
	});
}