import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import Select from '$lib/components/Select.svelte';
import { displaySettings, settings, themeSettings } from '$lib/data/settings.svelte.js';
import DataLanguageSelector from './snippets/DataLanguageSelector.svelte';
import LanguageSelector from './snippets/LanguageSelector.svelte';
import StoryCountSlider from './snippets/StoryCountSlider.svelte';
import ThemeSelector from './snippets/ThemeSelector.svelte';

export default function SettingsGeneral($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let { onShowAbout } = $$props;

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

		// Story expand mode options for display
		const storyExpandModeOptions = $.derived(() => [
			{
				value: 'always',
				label: s('settings.storyExpandMode.always') || 'Always expand all'
			},

			{
				value: 'doubleClick',
				label: s('settings.storyExpandMode.doubleClick') || 'Double-click to expand all'
			},

			{
				value: 'never',
				label: s('settings.storyExpandMode.never') || 'Never expand all'
			}
		]);

		// Story open mode options for display
		const storyOpenModeOptions = $.derived(() => [
			{
				value: 'multiple',
				label: s('settings.storyOpenMode.multiple') || 'Multiple stories'
			},

			{
				value: 'single',
				label: s('settings.storyOpenMode.single') || 'One story at a time'
			}
		]);

		// Maps provider options
		const mapsProviderOptions = $.derived(() => [
			{
				value: 'auto',
				label: s('settings.mapsProvider.auto') || 'Auto'
			},

			{
				value: 'kagi',
				label: s('settings.mapsProvider.kagi') || 'Kagi Maps'
			},

			{
				value: 'google',
				label: s('settings.mapsProvider.google') || 'Google Maps'
			},

			{
				value: 'openstreetmap',
				label: s('settings.mapsProvider.openstreetmap') || 'OpenStreetMap'
			},

			{
				value: 'apple',
				label: s('settings.mapsProvider.apple') || 'Apple Maps'
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

		let currentCategoryHeaderPosition = displaySettings.categoryHeaderPosition;
		let currentStoryExpandMode = displaySettings.storyExpandMode;
		let currentStoryOpenMode = displaySettings.storyOpenMode;
		let currentUseLatestUrls = displaySettings.useLatestUrls;
		let currentMapsProvider = displaySettings.mapsProvider;
		let currentLayoutWidth = displaySettings.layoutWidth;

		// Sync local state with stores
		// Font size change handler
		function handleFontSizeChange(newSize) {
			displaySettings.fontSize = newSize;
			settings.fontSize.save();
			currentFontSize = newSize;
		}

		// Category header position change handler
		function handleCategoryHeaderPositionChange(position) {
			displaySettings.categoryHeaderPosition = position;
			settings.categoryHeaderPosition.save();
			currentCategoryHeaderPosition = position;
		}

		function handleStoryExpandModeChange(mode) {
			displaySettings.storyExpandMode = mode;
			settings.storyExpandMode.save();
			currentStoryExpandMode = mode;
		}

		// Story open mode change handler
		function handleStoryOpenModeChange(mode) {
			displaySettings.storyOpenMode = mode;
			settings.storyOpenMode.save();
			currentStoryOpenMode = mode;
		}

		function handleUseLatestUrlsChange(value) {
			const enabled = value === 'enabled';

			displaySettings.useLatestUrls = enabled;
			settings.useLatestUrls.save();
			currentUseLatestUrls = enabled;
		}

		function handleMapsProviderChange(provider) {
			displaySettings.mapsProvider = provider;
			settings.mapsProvider.save();
			currentMapsProvider = provider;
		}

		function handleLayoutWidthChange(width) {
			displaySettings.layoutWidth = width;
			settings.layoutWidth.save();
			currentLayoutWidth = width;
		}

		// Show about screen
		function showAbout() {
			// Push /about to the URL
			window.history.pushState({}, '', '/about');

			if (onShowAbout) onShowAbout();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-8"><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.subsections.appearance") || "Appearance")}</h3> <div class="space-y-4 ps-2">`);
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

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.layoutWidth.description") || "Choose how wide the content area should be on larger screens")}</p></div></div></div> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.subsections.localization") || "Language & Region")}</h3> <div class="space-y-4 ps-2">`);
			LanguageSelector($$renderer, { showTooltip: true, showLoadingSpinner: true });
			$$renderer.push(`<!----> `);

			DataLanguageSelector($$renderer, {
				showTooltip: true,
				showLoadingSpinner: true,
				showTranslateLink: true
			});

			$$renderer.push(`<!----></div></div> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.subsections.readingExperience") || "Reading Experience")}</h3> <div class="space-y-4 ps-2">`);
			StoryCountSlider($$renderer, {});
			$$renderer.push(`<!----> <div class="flex flex-col space-y-2">`);

			Select($$renderer, {
				options: storyOpenModeOptions(),
				label: s("settings.storyOpenMode.label") || "Story Open Mode",
				onChange: handleStoryOpenModeChange,
				get value() {
					return currentStoryOpenMode;
				},

				set value($$value) {
					currentStoryOpenMode = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.storyOpenMode.description") || "Choose whether to allow multiple stories open at once or only one")}</p></div> <div class="flex flex-col space-y-2">`);

			Select($$renderer, {
				options: storyExpandModeOptions(),
				label: s("settings.storyExpandMode.label") || "Story Expand Mode",
				onChange: handleStoryExpandModeChange,
				get value() {
					return currentStoryExpandMode;
				},

				set value($$value) {
					currentStoryExpandMode = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.storyExpandMode.description") || "Choose how stories expand in a category")}</p></div> <div class="flex flex-col space-y-2 md:hidden">`);

			Select($$renderer, {
				options: [
					{
						value: "bottom",
						label: s("settings.categoryHeaderPosition.bottom") || "Bottom"
					},

					{
						value: "top",
						label: s("settings.categoryHeaderPosition.top") || "Top"
					}
				],
				label: s("settings.categoryHeaderPosition.label") || "Category Header Position",
				onChange: handleCategoryHeaderPositionChange,
				get value() {
					return currentCategoryHeaderPosition;
				},

				set value($$value) {
					currentCategoryHeaderPosition = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.categoryHeaderPosition.description") || "Choose where category tabs appear on mobile devices")}</p></div></div></div> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">${$.escape(s("settings.subsections.navigation") || "Navigation")}</h3> <div class="space-y-4 ps-2"><div class="flex flex-col space-y-2">`);

			Select($$renderer, {
				options: mapsProviderOptions(),
				label: s("settings.mapsProvider.label") || "Maps Provider",
				onChange: handleMapsProviderChange,
				get value() {
					return currentMapsProvider;
				},

				set value($$value) {
					currentMapsProvider = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${$.escape(s("settings.mapsProvider.description") || "Choose which maps service to use for location links")}</p></div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}