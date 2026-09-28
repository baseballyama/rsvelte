import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconInfoCircle, IconSparkles } from '@tabler/icons-svelte';
import { getContext } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import { categorySettings, readingLevelSettings } from '$lib/data/settings.svelte';
import DataLanguageSelector from './snippets/DataLanguageSelector.svelte';
import LanguageSelector from './snippets/LanguageSelector.svelte';

var root = $.from_html(`<button class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"> </button>`);
var root_1 = $.from_html(`<button><!> </button>`);
var root_2 = $.from_html(`<button class="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"> </button>`);
var root_3 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400 italic"> </p>`);
var root_4 = $.from_html(`<span class="ms-1 opacity-70"> </span>`);
var root_5 = $.from_html(`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"><!> <!></span>`);
var root_6 = $.from_html(`<button> </button>`);
var root_7 = $.from_html(`<div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"><div class="flex items-center gap-2"><span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"> </span> <!></div> <div class="flex items-center gap-1"></div></div>`);
var root_8 = $.from_html(`<div class="space-y-2"></div>`);
var root_9 = $.from_html(`<div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="ps-2 space-y-6"><p class="text-sm text-gray-600 dark:text-gray-400"> </p> <div><div class="flex items-center justify-between mb-2"><h4 class="text-sm font-medium text-gray-900 dark:text-gray-100"> </h4> <!></div> <p class="mb-3 text-xs text-gray-500 dark:text-gray-400"> </p> <div class="flex items-center gap-2"></div></div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700"><div class="flex items-center justify-between mb-2"><h4 class="text-sm font-medium text-gray-900 dark:text-gray-100"> </h4> <!></div> <p class="mb-4 text-xs text-gray-500 dark:text-gray-400"> </p> <!></div> <div class="pt-4 border-t border-gray-200 dark:border-gray-700"><div class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"><!> <div class="space-y-2"><p> </p> <p><strong> </strong> </p> <p><strong> </strong> </p></div></div></div></div></div>`);
var root_10 = $.from_html(`<div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="ps-2"><div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"><p class="text-sm text-gray-600 dark:text-gray-400"> </p> <a href="https://kagi.com/settings?p=billing" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"> </a></div></div></div>`);
var root_11 = $.from_html(`<div class="space-y-8"><div class="space-y-4"><h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300"> </h3> <div class="space-y-4 ps-2"><!> <!></div></div> <!></div>`);

export default function SettingsLanguage($$anchor, $$props) {
	$.push($$props, true);

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
	const hasAnySimplification = $.derived(() => readingLevelSettings.global !== 'normal' || $.get(overrideCount) > 0);

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

	var div = root_11();
	var div_1 = $.child(div);
	var h3 = $.child(div_1);
	var text = $.only_child(h3, true);
	var div_2 = $.sibling(h3, 2);
	var node = $.child(div_2);

	LanguageSelector(node, { showTooltip: true, showLoadingSpinner: true });

	var node_1 = $.sibling(node, 2);

	DataLanguageSelector(node_1, {
		showTooltip: true,
		showLoadingSpinner: true,
		showTranslateLink: true
	});

	$.reset(div_2);
	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_3 = root_9();
			var h3_1 = $.child(div_3);
			var text_1 = $.only_child(h3_1, true);
			var div_4 = $.sibling(h3_1, 2);
			var p = $.child(div_4);
			var text_2 = $.only_child(p, true);
			var div_5 = $.sibling(p, 2);
			var div_6 = $.child(div_5);
			var h4 = $.child(div_6);
			var text_3 = $.only_child(h4, true);
			var node_3 = $.sibling(h4, 2);

			{
				var consequent = ($$anchor) => {
					var button = root();
					var text_4 = $.only_child(button, true);

					$.template_effect(($0) => $.set_text(text_4, $0), [() => s('settings.readingLevel.resetAll') || 'Reset all']);
					$.delegated('click', button, () => readingLevelSettings.resetAll());
					$.append($$anchor, button);
				};

				$.if(node_3, ($$render) => {
					if ($.get(hasAnySimplification)) $$render(consequent);
				});
			}

			$.reset(div_6);

			var p_1 = $.sibling(div_6, 2);
			var text_5 = $.only_child(p_1, true);
			var div_7 = $.sibling(p_1, 2);

			$.each(div_7, 21, () => globalReadingLevels, $.index, ($$anchor, level) => {
				var button_1 = root_1();
				var node_4 = $.child(button_1);

				{
					var consequent_1 = ($$anchor) => {
						IconSparkles($$anchor, { size: 14, class: 'inline me-1.5 -mt-0.5' });
					};

					$.if(node_4, ($$render) => {
						if ($.get(level).value !== 'normal') $$render(consequent_1);
					});
				}

				var text_6 = $.sibling(node_4);

				$.reset(button_1);

				$.template_effect(
					($0) => {
						$.set_class(button_1, 1, `px-4 py-2 text-sm rounded-lg transition-colors ${readingLevelSettings.global === $.get(level).value
							? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
							: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`);

						$.set_attribute(button_1, 'title', $.get(level).description);
						$.set_text(text_6, ` ${$0 ?? ''}`);
					},
					[() => s($.get(level).labelKey) || $.get(level).fallback]
				);

				$.delegated('click', button_1, () => readingLevelSettings.global = $.get(level).value);
				$.append($$anchor, button_1);
			});

			$.reset(div_7);
			$.reset(div_5);

			var div_8 = $.sibling(div_5, 2);
			var div_9 = $.child(div_8);
			var h4_1 = $.child(div_9);
			var text_7 = $.only_child(h4_1, true);
			var node_5 = $.sibling(h4_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var button_2 = root_2();
					var text_8 = $.only_child(button_2, true);

					$.template_effect(($0) => $.set_text(text_8, $0), [
						() => s('settings.readingLevel.clearOverrides') || 'Clear overrides'
					]);

					$.delegated('click', button_2, () => readingLevelSettings.clearAllOverrides());
					$.append($$anchor, button_2);
				};

				$.if(node_5, ($$render) => {
					if ($.get(overrideCount) > 0) $$render(consequent_2);
				});
			}

			$.reset(div_9);

			var p_2 = $.sibling(div_9, 2);
			var text_9 = $.only_child(p_2, true);
			var node_6 = $.sibling(p_2, 2);

			{
				var consequent_3 = ($$anchor) => {
					var p_3 = root_3();
					var text_10 = $.only_child(p_3, true);

					$.template_effect(($0) => $.set_text(text_10, $0), [
						() => s('settings.readingLevel.noCategories') || 'No categories enabled. Enable categories in the Categories tab.'
					]);

					$.append($$anchor, p_3);
				};

				var alternate = ($$anchor) => {
					var div_10 = root_8();

					$.each(div_10, 21, () => $.get(enabledCategories), $.index, ($$anchor, category) => {
						const currentOverride = $.derived(() => getCategoryOverride($.get(category).id));
						const effectiveLevel = $.derived(() => readingLevelSettings.getForCategory($.get(category).id));
						var div_11 = root_7();
						var div_12 = $.child(div_11);
						var span = $.child(div_12);
						var text_11 = $.only_child(span, true);
						var node_7 = $.sibling(span, 2);

						{
							var consequent_5 = ($$anchor) => {
								var span_1 = root_5();
								var node_8 = $.child(span_1);

								IconSparkles(node_8, { size: 12, class: 'me-1' });

								var text_12 = $.sibling(node_8);
								var node_9 = $.sibling(text_12);

								{
									var consequent_4 = ($$anchor) => {
										var span_2 = root_4();
										var text_13 = $.only_child(span_2);

										$.template_effect(($0) => $.set_text(text_13, `(${$0 ?? ''})`), [() => s('settings.readingLevel.fromGlobal') || 'global']);
										$.append($$anchor, span_2);
									};

									$.if(node_9, ($$render) => {
										if ($.get(currentOverride) === 'use-global') $$render(consequent_4);
									});
								}

								$.reset(span_1);
								$.template_effect(($0) => $.set_text(text_12, ` ${$0 ?? ''} `), [() => getLevelLabel($.get(effectiveLevel))]);
								$.append($$anchor, span_1);
							};

							$.if(node_7, ($$render) => {
								if ($.get(effectiveLevel) && $.get(effectiveLevel) !== 'normal') $$render(consequent_5);
							});
						}

						$.reset(div_12);

						var div_13 = $.sibling(div_12, 2);

						$.each(div_13, 21, () => categoryReadingLevels, $.index, ($$anchor, level) => {
							var button_3 = root_6();
							var text_14 = $.only_child(button_3, true);

							$.template_effect(
								($0) => {
									$.set_class(button_3, 1, `px-2.5 py-1 text-xs rounded-md transition-colors ${$.get(currentOverride) === $.get(level).value
										? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
										: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`);

									$.set_attribute(button_3, 'title', $.get(level).description);
									$.set_text(text_14, $0);
								},
								[() => s($.get(level).labelKey) || $.get(level).fallback]
							);

							$.delegated('click', button_3, () => setCategoryLevel($.get(category).id, $.get(level).value));
							$.append($$anchor, button_3);
						});

						$.reset(div_13);
						$.reset(div_11);
						$.template_effect(() => $.set_text(text_11, $.get(category).name));
						$.append($$anchor, div_11);
					});

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_6, ($$render) => {
					if ($.get(enabledCategories).length === 0) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.reset(div_8);

			var div_14 = $.sibling(div_8, 2);
			var div_15 = $.child(div_14);
			var node_10 = $.child(div_15);

			IconInfoCircle(node_10, { size: 18, class: 'shrink-0 mt-0.5' });

			var div_16 = $.sibling(node_10, 2);
			var p_4 = $.child(div_16);
			var text_15 = $.only_child(p_4, true);
			var p_5 = $.sibling(p_4, 2);
			var strong = $.child(p_5);
			var text_16 = $.only_child(strong, true);
			var text_17 = $.sibling(strong);

			$.reset(p_5);

			var p_6 = $.sibling(p_5, 2);
			var strong_1 = $.child(p_6);
			var text_18 = $.only_child(strong_1, true);
			var text_19 = $.sibling(strong_1);

			$.reset(p_6);
			$.reset(div_16);
			$.reset(div_15);
			$.reset(div_14);
			$.reset(div_4);
			$.reset(div_3);

			$.template_effect(
				($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) => {
					$.set_text(text_1, $0);
					$.set_text(text_2, $1);
					$.set_text(text_3, $2);
					$.set_text(text_5, $3);
					$.set_text(text_7, $4);
					$.set_text(text_9, $5);
					$.set_text(text_15, $6);
					$.set_text(text_16, $7);
					$.set_text(text_17, `: ${$8 ?? ''}`);
					$.set_text(text_18, $9);
					$.set_text(text_19, `: ${$10 ?? ''}`);
				},
				[
					() => s("settings.readingLevel.title") || "Reading Level",
					() => s('settings.readingLevel.tab.description') || 'Set a default reading level for all stories. You can also customize the level for specific categories.',
					() => s('settings.readingLevel.global.label') || 'Default Reading Level',
					() => s('settings.readingLevel.global.description') || 'This applies to all categories unless you set a specific level below.',
					() => s('settings.readingLevel.categories.label') || 'Category Overrides',
					() => s('settings.readingLevel.categories.description') || 'Override the default level for specific categories. Categories set to "Global" will use your default setting above.',
					() => s('settings.readingLevel.info.howItWorks') || 'When you open a story, the content will be automatically simplified to your chosen reading level. You can still manually change the level for any story.',
					() => s('story.simplify.simple') || 'Simple',
					() => s('settings.readingLevel.info.simpleDescription') || 'Clear language at an intermediate level (B1). Good for general readers.',
					() => s('story.simplify.verySimple') || 'Very Simple',
					() => s('settings.readingLevel.info.verySimpleDescription') || 'Basic vocabulary and short sentences (A2). Ideal for language learners.'
				]
			);

			$.append($$anchor, div_3);
		};

		var alternate_1 = ($$anchor) => {
			var div_17 = root_10();
			var h3_2 = $.child(div_17);
			var text_20 = $.only_child(h3_2, true);
			var div_18 = $.sibling(h3_2, 2);
			var div_19 = $.child(div_18);
			var p_7 = $.child(div_19);
			var text_21 = $.only_child(p_7, true);
			var a_1 = $.sibling(p_7, 2);
			var text_22 = $.only_child(a_1, true);

			$.reset(div_19);
			$.reset(div_18);
			$.reset(div_17);

			$.template_effect(
				($0, $1, $2) => {
					$.set_text(text_20, $0);
					$.set_text(text_21, $1);
					$.set_text(text_22, $2);
				},
				[
					() => s("settings.readingLevel.title") || "Reading Level",
					() => s("settings.readingLevel.subscriberOnly") || "Reading level simplification is available for Kagi subscribers. Upgrade to automatically simplify articles to your preferred reading level.",
					() => s("settings.readingLevel.upgrade") || "Upgrade to Kagi"
				]
			);

			$.append($$anchor, div_17);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isSubscriber)) $$render(consequent_6); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => s("settings.subsections.localization") || "Language & Region"
	]);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);