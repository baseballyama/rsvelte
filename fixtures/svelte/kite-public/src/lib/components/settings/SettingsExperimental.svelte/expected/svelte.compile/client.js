import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { experimental } from '$lib/stores/experimental.svelte.js';

var root = $.from_html(`<div class="space-y-6"><p class="mb-6 text-sm text-gray-600 dark:text-gray-400">⚠️ <span class="ms-1"> </span></p> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><div class="mb-2 flex items-center justify-between"><label for="show-article-icons" id="label-article-icons" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <button id="show-article-icons" type="button" role="switch" aria-labelledby="label-article-icons"><span></span></button></div> <p class="text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><div class="mb-2 flex items-center justify-between"><label for="show-category-icons" id="label-category-icons" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <button id="show-category-icons" type="button" role="switch" aria-labelledby="label-category-icons"><span></span></button></div> <p class="text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><div class="mb-2 flex items-center justify-between"><label for="disable-category-swipe" id="label-disable-swipe" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <button id="disable-category-swipe" type="button" role="switch" aria-labelledby="label-disable-swipe"><span></span></button></div> <p class="text-xs text-gray-500 dark:text-gray-400"> </p></div> <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><div class="mb-2 flex items-center justify-between"><label for="show-chaos-index" id="label-chaos-index" class="text-sm font-medium text-gray-700 dark:text-gray-300"> </label> <button id="show-chaos-index" type="button" role="switch" aria-labelledby="label-chaos-index"><span class="sr-only"> </span> <span></span></button></div> <p class="text-xs text-gray-500 dark:text-gray-400"> </p></div></div>`);

export default function SettingsExperimental($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root();
	var p = $.child(div);
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);

	$.reset(p);

	var div_1 = $.sibling(p, 2);
	var div_2 = $.child(div_1);
	var label = $.child(div_2);
	var text_1 = $.only_child(label, true);
	var button = $.sibling(label, 2);
	let classes;
	var span_1 = $.child(button);
	let classes_1;

	$.reset(button);
	$.reset(div_2);

	var p_1 = $.sibling(div_2, 2);
	var text_2 = $.only_child(p_1, true);

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var label_1 = $.child(div_4);
	var text_3 = $.only_child(label_1, true);
	var button_1 = $.sibling(label_1, 2);
	let classes_2;
	var span_2 = $.child(button_1);
	let classes_3;

	$.reset(button_1);
	$.reset(div_4);

	var p_2 = $.sibling(div_4, 2);
	var text_4 = $.only_child(p_2, true);

	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var label_2 = $.child(div_6);
	var text_5 = $.only_child(label_2, true);
	var button_2 = $.sibling(label_2, 2);
	let classes_4;
	var span_3 = $.child(button_2);
	let classes_5;

	$.reset(button_2);
	$.reset(div_6);

	var p_3 = $.sibling(div_6, 2);
	var text_6 = $.only_child(p_3, true);

	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var div_8 = $.child(div_7);
	var label_3 = $.child(div_8);
	var text_7 = $.only_child(label_3, true);
	var button_3 = $.sibling(label_3, 2);
	let classes_6;
	var span_4 = $.child(button_3);
	var text_8 = $.only_child(span_4, true);
	var span_5 = $.sibling(span_4, 2);
	let classes_7;

	$.reset(button_3);
	$.reset(div_8);

	var p_4 = $.sibling(div_8, 2);
	var text_9 = $.only_child(p_4, true);

	$.reset(div_7);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);

			classes = $.set_class(button, 1, 'focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition', null, classes, {
				'bg-blue-600': experimental.showArticleIcons,
				'bg-gray-200': !experimental.showArticleIcons,
				'dark:bg-gray-600': !experimental.showArticleIcons
			});

			$.set_attribute(button, 'aria-checked', experimental.showArticleIcons);

			classes_1 = $.set_class(span_1, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_1, {
				'ltr:translate-x-6': experimental.showArticleIcons,
				'rtl:-translate-x-6': experimental.showArticleIcons,
				'ltr:translate-x-1': !experimental.showArticleIcons,
				'rtl:-translate-x-1': !experimental.showArticleIcons
			});

			$.set_text(text_2, $2);
			$.set_text(text_3, $3);

			classes_2 = $.set_class(button_1, 1, 'focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition', null, classes_2, {
				'bg-blue-600': experimental.showCategoryIcons,
				'bg-gray-200': !experimental.showCategoryIcons,
				'dark:bg-gray-600': !experimental.showCategoryIcons
			});

			$.set_attribute(button_1, 'aria-checked', experimental.showCategoryIcons);

			classes_3 = $.set_class(span_2, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_3, {
				'ltr:translate-x-6': experimental.showCategoryIcons,
				'rtl:-translate-x-6': experimental.showCategoryIcons,
				'ltr:translate-x-1': !experimental.showCategoryIcons,
				'rtl:-translate-x-1': !experimental.showCategoryIcons
			});

			$.set_text(text_4, $4);
			$.set_text(text_5, $5);

			classes_4 = $.set_class(button_2, 1, 'focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition', null, classes_4, {
				'bg-blue-600': experimental.disableCategorySwipe,
				'bg-gray-200': !experimental.disableCategorySwipe,
				'dark:bg-gray-600': !experimental.disableCategorySwipe
			});

			$.set_attribute(button_2, 'aria-checked', experimental.disableCategorySwipe);

			classes_5 = $.set_class(span_3, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_5, {
				'ltr:translate-x-6': experimental.disableCategorySwipe,
				'rtl:-translate-x-6': experimental.disableCategorySwipe,
				'ltr:translate-x-1': !experimental.disableCategorySwipe,
				'rtl:-translate-x-1': !experimental.disableCategorySwipe
			});

			$.set_text(text_6, $6);
			$.set_text(text_7, $7);

			classes_6 = $.set_class(button_3, 1, 'focus-visible-ring relative inline-flex h-6 w-11 items-center rounded-full transition', null, classes_6, {
				'bg-blue-600': experimental.showChaosIndex,
				'bg-gray-200': !experimental.showChaosIndex,
				'dark:bg-gray-600': !experimental.showChaosIndex
			});

			$.set_attribute(button_3, 'aria-checked', experimental.showChaosIndex);
			$.set_text(text_8, $8);

			classes_7 = $.set_class(span_5, 1, 'inline-block h-4 w-4 transform rounded-full bg-white transition', null, classes_7, {
				'ltr:translate-x-6': experimental.showChaosIndex,
				'rtl:-translate-x-6': experimental.showChaosIndex,
				'ltr:translate-x-1': !experimental.showChaosIndex,
				'rtl:-translate-x-1': !experimental.showChaosIndex
			});

			$.set_text(text_9, $9);
		},
		[
			() => s("settings.experimental.warning") || "These features are experimental and may change or be removed in future versions.",
			() => s("settings.experimental.articleIcons.label") || "Show Article Icons",
			() => s("settings.experimental.articleIcons.description") || "Display emoji icons next to article titles to provide visual context.",
			() => s("settings.experimental.categoryIcons.label") || "Show Category Icons",
			() => s("settings.experimental.categoryIcons.description") || "Display icons next to category labels for better visual identification.",
			() => s("settings.experimental.disableCategorySwipe.label") || "Disable horizontal category swiping",
			() => s("settings.experimental.disableCategorySwipe.description") || "When enabled, horizontal swiping to change categories on mobile devices will be disabled.",
			() => s("settings.experimental.chaosIndex.label") || "Show World Tension Index",
			() => s("settings.experimental.chaosIndex.label") || "Show World Tension Index",
			() => s("settings.experimental.chaosIndex.description") || "Display a global temperature reading of world stability based on current events."
		]
	);

	$.delegated('click', button, toggleArticleIcons);
	$.delegated('click', button_1, toggleCategoryIcons);
	$.delegated('click', button_2, toggleDisableCategorySwipe);
	$.delegated('click', button_3, toggleChaosIndex);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);