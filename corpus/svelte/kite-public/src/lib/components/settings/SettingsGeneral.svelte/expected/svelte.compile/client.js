import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import Select from '$lib/components/Select.svelte';
import { displaySettings, settings, themeSettings } from '$lib/data/settings.svelte.js';
import DataLanguageSelector from './snippets/DataLanguageSelector.svelte';
import LanguageSelector from './snippets/LanguageSelector.svelte';
import StoryCountSlider from './snippets/StoryCountSlider.svelte';
import ThemeSelector from './snippets/ThemeSelector.svelte';

var root = $.from_html(`<div class="space-y-8"><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="space-y-4 ps-2"><!> <div class="flex flex-col space-y-2"><!></div> <div class="hidden md:flex flex-col space-y-2"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div></div></div> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="space-y-4 ps-2"><!> <!></div></div> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="space-y-4 ps-2"><!> <div class="flex flex-col space-y-2"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="flex flex-col space-y-2"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="flex flex-col space-y-2 md:hidden"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div></div></div> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="space-y-4 ps-2"><div class="flex flex-col space-y-2"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div></div></div></div>`);

export default function SettingsGeneral($$anchor, $$props) {
	$.push($$props, true);

	// Props
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
	let currentFontSize = $.state($.proxy(displaySettings.fontSize));

	let currentCategoryHeaderPosition = $.state($.proxy(displaySettings.categoryHeaderPosition));
	let currentStoryExpandMode = $.state($.proxy(displaySettings.storyExpandMode));
	let currentStoryOpenMode = $.state($.proxy(displaySettings.storyOpenMode));
	let currentUseLatestUrls = $.state($.proxy(displaySettings.useLatestUrls));
	let currentMapsProvider = $.state($.proxy(displaySettings.mapsProvider));
	let currentLayoutWidth = $.state($.proxy(displaySettings.layoutWidth));

	// Sync local state with stores
	$.user_effect(() => {
		$.set(currentFontSize, displaySettings.fontSize, true);
	});

	$.user_effect(() => {
		$.set(currentCategoryHeaderPosition, displaySettings.categoryHeaderPosition, true);
	});

	$.user_effect(() => {
		$.set(currentStoryExpandMode, displaySettings.storyExpandMode, true);
	});

	$.user_effect(() => {
		$.set(currentStoryOpenMode, displaySettings.storyOpenMode, true);
	});

	$.user_effect(() => {
		$.set(currentUseLatestUrls, displaySettings.useLatestUrls, true);
	});

	$.user_effect(() => {
		$.set(currentMapsProvider, displaySettings.mapsProvider, true);
	});

	$.user_effect(() => {
		$.set(currentLayoutWidth, displaySettings.layoutWidth, true);
	});

	// Font size change handler
	function handleFontSizeChange(newSize) {
		displaySettings.fontSize = newSize;
		settings.fontSize.save();
		$.set(currentFontSize, newSize, true);
	}

	// Category header position change handler
	function handleCategoryHeaderPositionChange(position) {
		displaySettings.categoryHeaderPosition = position;
		settings.categoryHeaderPosition.save();
		$.set(currentCategoryHeaderPosition, position, true);
	}

	function handleStoryExpandModeChange(mode) {
		displaySettings.storyExpandMode = mode;
		settings.storyExpandMode.save();
		$.set(currentStoryExpandMode, mode, true);
	}

	// Story open mode change handler
	function handleStoryOpenModeChange(mode) {
		displaySettings.storyOpenMode = mode;
		settings.storyOpenMode.save();
		$.set(currentStoryOpenMode, mode, true);
	}

	function handleUseLatestUrlsChange(value) {
		const enabled = value === 'enabled';

		displaySettings.useLatestUrls = enabled;
		settings.useLatestUrls.save();
		$.set(currentUseLatestUrls, enabled);
	}

	function handleMapsProviderChange(provider) {
		displaySettings.mapsProvider = provider;
		settings.mapsProvider.save();
		$.set(currentMapsProvider, provider, true);
	}

	function handleLayoutWidthChange(width) {
		displaySettings.layoutWidth = width;
		settings.layoutWidth.save();
		$.set(currentLayoutWidth, width, true);
	}

	// Show about screen
	function showAbout() {
		// Push /about to the URL
		window.history.pushState({}, '', '/about');

		if ($$props.onShowAbout) $$props.onShowAbout();
	}

	var div = root();
	var div_1 = $.child(div);
	var h3 = $.child(div_1);
	var text = $.only_child(h3, true);
	var div_2 = $.sibling(h3, 2);
	var node = $.child(div_2);

	ThemeSelector(node, {});

	var div_3 = $.sibling(node, 2);
	var node_1 = $.child(div_3);

	{
		let $0 = $.derived(() => s("settings.fontSize.label") || "Text Size");

		Select(node_1, {
			get options() {
				return $.get(fontSizeOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleFontSizeChange,
			get value() {
				return $.get(currentFontSize);
			},

			set value($$value) {
				$.set(currentFontSize, $$value, true);
			}
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	{
		let $0 = $.derived(() => s("settings.layoutWidth.label") || "Layout Width");

		Select(node_2, {
			get options() {
				return $.get(layoutWidthOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleLayoutWidthChange,
			get value() {
				return $.get(currentLayoutWidth);
			},

			set value($$value) {
				$.set(currentLayoutWidth, $$value, true);
			}
		});
	}

	var p = $.sibling(node_2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var h3_1 = $.child(div_5);
	var text_2 = $.only_child(h3_1, true);
	var div_6 = $.sibling(h3_1, 2);
	var node_3 = $.child(div_6);

	LanguageSelector(node_3, { showTooltip: true, showLoadingSpinner: true });

	var node_4 = $.sibling(node_3, 2);

	DataLanguageSelector(node_4, {
		showTooltip: true,
		showLoadingSpinner: true,
		showTranslateLink: true
	});

	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var h3_2 = $.child(div_7);
	var text_3 = $.only_child(h3_2, true);
	var div_8 = $.sibling(h3_2, 2);
	var node_5 = $.child(div_8);

	StoryCountSlider(node_5, {});

	var div_9 = $.sibling(node_5, 2);
	var node_6 = $.child(div_9);

	{
		let $0 = $.derived(() => s("settings.storyOpenMode.label") || "Story Open Mode");

		Select(node_6, {
			get options() {
				return $.get(storyOpenModeOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleStoryOpenModeChange,
			get value() {
				return $.get(currentStoryOpenMode);
			},

			set value($$value) {
				$.set(currentStoryOpenMode, $$value, true);
			}
		});
	}

	var p_1 = $.sibling(node_6, 2);
	var text_4 = $.only_child(p_1, true);

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_7 = $.child(div_10);

	{
		let $0 = $.derived(() => s("settings.storyExpandMode.label") || "Story Expand Mode");

		Select(node_7, {
			get options() {
				return $.get(storyExpandModeOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleStoryExpandModeChange,
			get value() {
				return $.get(currentStoryExpandMode);
			},

			set value($$value) {
				$.set(currentStoryExpandMode, $$value, true);
			}
		});
	}

	var p_2 = $.sibling(node_7, 2);
	var text_5 = $.only_child(p_2, true);

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_8 = $.child(div_11);

	{
		let $0 = $.derived(() => [
			{
				value: "bottom",
				label: s("settings.categoryHeaderPosition.bottom") || "Bottom"
			},

			{
				value: "top",
				label: s("settings.categoryHeaderPosition.top") || "Top"
			}
		]);

		let $1 = $.derived(() => s("settings.categoryHeaderPosition.label") || "Category Header Position");

		Select(node_8, {
			get options() {
				return $.get($0);
			},

			get label() {
				return $.get($1);
			},
			onChange: handleCategoryHeaderPositionChange,
			get value() {
				return $.get(currentCategoryHeaderPosition);
			},

			set value($$value) {
				$.set(currentCategoryHeaderPosition, $$value, true);
			}
		});
	}

	var p_3 = $.sibling(node_8, 2);
	var text_6 = $.only_child(p_3, true);

	$.reset(div_11);
	$.reset(div_8);
	$.reset(div_7);

	var div_12 = $.sibling(div_7, 2);
	var h3_3 = $.child(div_12);
	var text_7 = $.only_child(h3_3, true);
	var div_13 = $.sibling(h3_3, 2);
	var div_14 = $.child(div_13);
	var node_9 = $.child(div_14);

	{
		let $0 = $.derived(() => s("settings.mapsProvider.label") || "Maps Provider");

		Select(node_9, {
			get options() {
				return $.get(mapsProviderOptions);
			},

			get label() {
				return $.get($0);
			},
			onChange: handleMapsProviderChange,
			get value() {
				return $.get(currentMapsProvider);
			},

			set value($$value) {
				$.set(currentMapsProvider, $$value, true);
			}
		});
	}

	var p_4 = $.sibling(node_9, 2);
	var text_8 = $.only_child(p_4, true);

	$.reset(div_14);
	$.reset(div_13);
	$.reset(div_12);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_3, $3);
			$.set_text(text_4, $4);
			$.set_text(text_5, $5);
			$.set_text(text_6, $6);
			$.set_text(text_7, $7);
			$.set_text(text_8, $8);
		},
		[
			() => s("settings.subsections.appearance") || "Appearance",
			() => s("settings.layoutWidth.description") || "Choose how wide the content area should be on larger screens",
			() => s("settings.subsections.localization") || "Language & Region",
			() => s("settings.subsections.readingExperience") || "Reading Experience",
			() => s("settings.storyOpenMode.description") || "Choose whether to allow multiple stories open at once or only one",
			() => s("settings.storyExpandMode.description") || "Choose how stories expand in a category",
			() => s("settings.categoryHeaderPosition.description") || "Choose where category tabs appear on mobile devices",
			() => s("settings.subsections.navigation") || "Navigation",
			() => s("settings.mapsProvider.description") || "Choose which maps service to use for location links"
		]
	);

	$.append($$anchor, div);
	$.pop();
}