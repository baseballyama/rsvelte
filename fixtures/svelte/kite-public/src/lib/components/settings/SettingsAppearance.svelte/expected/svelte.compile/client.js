import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import Select from '$lib/components/Select.svelte';
import { displaySettings, settings } from '$lib/data/settings.svelte.js';
import { experimental } from '$lib/stores/experimental.svelte.js';
import ThemeSelector from './snippets/ThemeSelector.svelte';

var root = $.from_html(`<div class="space-y-8"><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="space-y-4 ps-2"><!> <div class="flex flex-col space-y-2"><!></div> <div class="hidden md:flex flex-col space-y-2"><!> <p class="mt-1 text-xs text-gray-500 dark:text-gray-400"> </p></div></div></div> <div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="space-y-3 ps-2"><div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex-1 pe-4"><label for="show-article-icons" id="label-article-icons" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"> </p></div> <button id="show-article-icons" type="button" role="switch" aria-labelledby="label-article-icons"><span></span></button></div> <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex-1 pe-4"><label for="show-category-icons" id="label-category-icons" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"> </p></div> <button id="show-category-icons" type="button" role="switch" aria-labelledby="label-category-icons"><span></span></button></div> <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex-1 pe-4"><label for="show-chaos-index" id="label-chaos-index" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"> </p></div> <button id="show-chaos-index" type="button" role="switch" aria-labelledby="label-chaos-index"><span></span></button></div></div></div></div>`);

export default function SettingsAppearance($$anchor, $$props) {
	$.push($$props, true);

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
	let currentFontSize = $.state($.proxy(displaySettings.fontSize));

	let currentLayoutWidth = $.state($.proxy(displaySettings.layoutWidth));

	// Sync local state with stores
	$.user_effect(() => {
		$.set(currentFontSize, displaySettings.fontSize, true);
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

	function handleLayoutWidthChange(width) {
		displaySettings.layoutWidth = width;
		settings.layoutWidth.save();
		$.set(currentLayoutWidth, width, true);
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
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var label = $.child(div_8);
	var text_3 = $.only_child(label, true);
	var p_1 = $.sibling(label, 2);
	var text_4 = $.only_child(p_1, true);

	$.reset(div_8);

	var button = $.sibling(div_8, 2);
	let classes;
	var span = $.child(button);
	let classes_1;

	$.reset(button);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var div_10 = $.child(div_9);
	var label_1 = $.child(div_10);
	var text_5 = $.only_child(label_1, true);
	var p_2 = $.sibling(label_1, 2);
	var text_6 = $.only_child(p_2, true);

	$.reset(div_10);

	var button_1 = $.sibling(div_10, 2);
	let classes_2;
	var span_1 = $.child(button_1);
	let classes_3;

	$.reset(button_1);
	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var div_12 = $.child(div_11);
	var label_2 = $.child(div_12);
	var text_7 = $.only_child(label_2, true);
	var p_3 = $.sibling(label_2, 2);
	var text_8 = $.only_child(p_3, true);

	$.reset(div_12);

	var button_2 = $.sibling(div_12, 2);
	let classes_4;
	var span_2 = $.child(button_2);
	let classes_5;

	$.reset(button_2);
	$.reset(div_11);
	$.reset(div_6);
	$.reset(div_5);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_3, $3);
			$.set_text(text_4, $4);

			classes = $.set_class(button, 1, 'focus-visible-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', null, classes, {
				'bg-blue-600': experimental.showArticleIcons,
				'bg-gray-200': !experimental.showArticleIcons,
				'dark:bg-gray-600': !experimental.showArticleIcons
			});

			$.set_attribute(button, 'aria-checked', experimental.showArticleIcons);

			classes_1 = $.set_class(span, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_1, {
				'ltr:translate-x-6': experimental.showArticleIcons,
				'rtl:-translate-x-6': experimental.showArticleIcons,
				'ltr:translate-x-1': !experimental.showArticleIcons,
				'rtl:-translate-x-1': !experimental.showArticleIcons
			});

			$.set_text(text_5, $5);
			$.set_text(text_6, $6);

			classes_2 = $.set_class(button_1, 1, 'focus-visible-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', null, classes_2, {
				'bg-blue-600': experimental.showCategoryIcons,
				'bg-gray-200': !experimental.showCategoryIcons,
				'dark:bg-gray-600': !experimental.showCategoryIcons
			});

			$.set_attribute(button_1, 'aria-checked', experimental.showCategoryIcons);

			classes_3 = $.set_class(span_1, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_3, {
				'ltr:translate-x-6': experimental.showCategoryIcons,
				'rtl:-translate-x-6': experimental.showCategoryIcons,
				'ltr:translate-x-1': !experimental.showCategoryIcons,
				'rtl:-translate-x-1': !experimental.showCategoryIcons
			});

			$.set_text(text_7, $7);
			$.set_text(text_8, $8);

			classes_4 = $.set_class(button_2, 1, 'focus-visible-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', null, classes_4, {
				'bg-blue-600': experimental.showChaosIndex,
				'bg-gray-200': !experimental.showChaosIndex,
				'dark:bg-gray-600': !experimental.showChaosIndex
			});

			$.set_attribute(button_2, 'aria-checked', experimental.showChaosIndex);

			classes_5 = $.set_class(span_2, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_5, {
				'ltr:translate-x-6': experimental.showChaosIndex,
				'rtl:-translate-x-6': experimental.showChaosIndex,
				'ltr:translate-x-1': !experimental.showChaosIndex,
				'rtl:-translate-x-1': !experimental.showChaosIndex
			});
		},
		[
			() => s("settings.subsections.display") || "Display",
			() => s("settings.layoutWidth.description") || "Choose how wide the content area should be on larger screens",
			() => s("settings.subsections.visualEnhancements") || "Visual Enhancements",
			() => s("settings.experimental.articleIcons.label") || "Show Article Icons",
			() => s("settings.experimental.articleIcons.description") || "Display emoji icons next to article titles to provide visual context.",
			() => s("settings.experimental.categoryIcons.label") || "Show Category Icons",
			() => s("settings.experimental.categoryIcons.description") || "Display icons next to category labels for better visual identification.",
			() => s("settings.experimental.chaosIndex.label") || "Show World Tension Index",
			() => s("settings.experimental.chaosIndex.description") || "Display a global temperature reading of world stability based on current events."
		]
	);

	$.delegated('click', button, toggleArticleIcons);
	$.delegated('click', button_1, toggleCategoryIcons);
	$.delegated('click', button_2, toggleChaosIndex);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);