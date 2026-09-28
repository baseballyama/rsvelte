import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconAlertTriangle,
	IconChevronDown,
	IconChevronUp,
	IconCircleX,
	IconInfoCircle,
	IconLoader2
} from '@tabler/icons-svelte';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
import { s } from '$lib/client/localization.svelte';
import Select from '$lib/components/Select.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';

var root = $.from_html(`<div class="flex items-center gap-2 text-sm text-primary-600"><!> </div>`);
var root_1 = $.from_html(`<div class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2"><!> <button class="text-accent-links hover:underline"> </button></div>`);
var root_2 = $.from_html(`<p class="mt-3 text-xs text-primary-500 flex items-start gap-1.5"><!> <span> </span></p>`);
var root_3 = $.from_html(`<p class="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5"><!> <span> <a target="_blank" rel="noopener noreferrer" class="text-accent-links hover:underline"> </a></span></p>`);
var root_4 = $.from_html(`<span class="ml-2 px-1.5 py-0.5 bg-primary-100 rounded text-xs"> </span>`);
var root_5 = $.from_html(`<button class="ml-2 text-accent-links hover:underline inline-flex items-center gap-0.5"> <!></button>`);
var root_6 = $.from_html(`<div class="text-primary-600 truncate"> </div>`);
var root_7 = $.from_html(`<div class="p-3 text-xs font-mono space-y-0.5" style="max-height: 12rem;"></div>`);
var root_8 = $.from_html(`<div class="mt-2 bg-primary-50 rounded-md" style="max-height: 12rem;"><!></div>`);
var root_9 = $.from_html(`<!> <!> <div class="mt-3 text-sm text-primary-600"><span class="font-medium text-primary"> </span> <!> <!></div> <!>`, 1);
var root_10 = $.from_html(`<p class="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5"><!> <span> <a target="_blank" rel="noopener noreferrer" class="text-accent-links hover:underline"> </a></span></p>`);
var root_11 = $.from_html(`<!> <!>`, 1);
var root_12 = $.from_html(`<p class="mt-1 text-xs text-amber-600 dark:text-amber-400"> <button class="text-accent-links hover:underline"> </button></p>`);
var root_13 = $.from_html(`<p class="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5"><!> <span> </span></p>`);
var root_14 = $.from_html(`<div class="space-y-3"><div><label for="new-category-name" class="block text-sm font-medium text-primary-700 mb-1"> </label> <input id="new-category-name" type="text" class="w-full px-3 py-2 border border-primary-300 rounded-lg bg-input-bg text-primary placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-focus-ring text-sm"/> <!> <!></div> <div><div class="flex items-center gap-1.5 mb-1"><label for="new-category-lang" class="block text-sm font-medium text-primary-700"> </label> <!></div> <!></div></div>`);
var root_15 = $.from_html(`<div class="bg-modal-bg rounded-lg border border-primary-200 p-5"><h2 class="text-base font-semibold text-primary mb-4"> </h2> <div class="flex gap-2 mb-4"><button> </button> <button> </button></div> <!></div>`);

export default function ContributeCategoryStep($$anchor, $$props) {
	$.push($$props, true);

	let mode = $.prop($$props, 'mode', 15),
		selectedCategory = $.prop($$props, 'selectedCategory', 15),
		newCategoryName = $.prop($$props, 'newCategoryName', 15),
		newCategoryLanguage = $.prop($$props, 'newCategoryLanguage', 15),
		showExistingFeeds = $.prop($$props, 'showExistingFeeds', 15);

	// Detect language codes in category name like "Switzerland (IT)" or "Japan (EN)"
	const LANG_CODE_PATTERN = /\s*\(\s*(?:EN|DE|ES|FR|IT|JA|PT|AR|HE|HI|KO|NL|RU|UK|ET|ZH)\s*\)\s*$/i;

	const hasLanguageInName = $.derived(() => LANG_CODE_PATTERN.test(newCategoryName().trim()));

	// Build a map of category names that have pending PRs
	const pendingPrMap = $.derived(() => new Map($$props.pendingPrs.map((pr) => [pr.categoryName, pr])));

	const categoryOptions = $.derived(() => $$props.feedsData
		? Object.entries($$props.feedsData).map(([name, data]) => {
			const isCore = data.category_type === 'core';
			const pendingPr = $.get(pendingPrMap).get(name);
			let label = name;

			if (isCore) {
				label += ` (${s('contribute.coreCategory')})`;
			} else {
				label += ` (${s('contribute.feedCount', { count: String(data.feeds.length) })})`;
			}

			if (pendingPr) {
				label += ` · ${s('contribute.pendingFeedsAdded', { count: String(pendingPr.feedCount) })}`;
			}

			return { value: name, label };
		}).sort((a, b) => a.value.localeCompare(b.value))
		: []);

	// Pending PR categories that don't exist in feeds data yet (new categories from PRs)
	const pendingOnlyOptions = $.derived(() => $$props.pendingPrs.filter((pr) => pr.isNew && $$props.feedsData && !$$props.feedsData[pr.categoryName]).map((pr) => ({
		value: pr.categoryName,
		label: `${pr.categoryName} (${s('contribute.pendingPr')} · ${s('contribute.pendingFeedCount', { count: String(pr.feedCount) })})`
	})));

	const allCategoryOptions = $.derived(() => [
		...$.get(categoryOptions),
		...$.get(pendingOnlyOptions).length > 0
			? [
				{
					value: '',
					label: `── ${s('contribute.pendingPr')} ──`,
					disabled: true
				},
				...$.get(pendingOnlyOptions)
			]
			: []
	]);

	const currentCategoryData = $.derived(() => $$props.feedsData && selectedCategory() ? $$props.feedsData[selectedCategory()] : null);

	const LANGUAGES = [
		{ value: 'en', label: 'English' },
		{ value: 'de', label: 'Deutsch' },
		{ value: 'es', label: 'Español' },
		{ value: 'fr', label: 'Français' },
		{ value: 'it', label: 'Italiano' },
		{ value: 'ja', label: '日本語' },
		{ value: 'pt', label: 'Português' },
		{ value: 'zh-Hans', label: '简体中文' },
		{ value: 'zh-Hant', label: '繁體中文' },
		{ value: 'ar', label: 'العربية' },
		{ value: 'he', label: 'עברית' },
		{ value: 'hi', label: 'हिन्दी' },
		{ value: 'ko', label: '한국어' },
		{ value: 'nl', label: 'Nederlands' },
		{ value: 'ru', label: 'Русский' },
		{ value: 'uk', label: 'Українська' },
		{ value: 'et', label: 'Eesti' }
	];

	var div = root_15();
	var h2 = $.child(div);
	var text = $.only_child(h2, true);
	var div_1 = $.sibling(h2, 2);
	var button = $.child(div_1);
	var text_1 = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_2 = $.only_child(button_1, true);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent_11 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();
					var node_2 = $.child(div_2);

					IconLoader2(node_2, { size: 16, class: 'animate-spin' });

					var text_3 = $.sibling(node_2);

					$.reset(div_2);
					$.template_effect(($0) => $.set_text(text_3, ` ${$0 ?? ''}`), [() => s('contribute.loadingCategories')]);
					$.append($$anchor, div_2);
				};

				var consequent_1 = ($$anchor) => {
					var div_3 = root_1();
					var node_3 = $.child(div_3);

					IconCircleX(node_3, { size: 16 });

					var text_4 = $.sibling(node_3);
					var button_2 = $.sibling(text_4);
					var text_5 = $.only_child(button_2, true);

					$.reset(div_3);

					$.template_effect(
						($0) => {
							$.set_text(text_4, ` ${$$props.loadError ?? ''} `);
							$.set_text(text_5, $0);
						},
						[() => s('contribute.retry')]
					);

					$.delegated('click', button_2, function (...$$args) {
						$$props.onLoadRetry?.apply(this, $$args);
					});

					$.append($$anchor, div_3);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_1 = root_11();
					var node_4 = $.first_child(fragment_1);

					{
						let $0 = $.derived(() => s('contribute.searchCategories'));
						let $1 = $.derived(() => s('contribute.existingCategory'));

						Select(node_4, {
							get value() {
								return selectedCategory();
							},

							get options() {
								return $.get(allCategoryOptions);
							},

							get placeholder() {
								return $.get($0);
							},
							searchable: true,
							get onChange() {
								return $$props.onCategoryChange;
							},
							id: 'category-select',
							get label() {
								return $.get($1);
							},
							hideLabel: true
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_8 = ($$anchor) => {
							const isCore = $.derived(() => $.get(currentCategoryData).category_type === 'core');
							const pendingPr = $.derived(() => $.get(pendingPrMap).get(selectedCategory()));
							var fragment_2 = root_9();
							var node_6 = $.first_child(fragment_2);

							{
								var consequent_2 = ($$anchor) => {
									var p = root_2();
									var node_7 = $.child(p);

									IconInfoCircle(node_7, { size: 14, class: 'shrink-0 mt-0.5' });

									var span = $.sibling(node_7, 2);
									var text_6 = $.only_child(span, true);

									$.reset(p);
									$.template_effect(($0) => $.set_text(text_6, $0), [() => s('contribute.coreCategoryNote')]);
									$.append($$anchor, p);
								};

								$.if(node_6, ($$render) => {
									if ($.get(isCore)) $$render(consequent_2);
								});
							}

							var node_8 = $.sibling(node_6, 2);

							{
								var consequent_3 = ($$anchor) => {
									var p_1 = root_3();
									var node_9 = $.child(p_1);

									IconInfoCircle(node_9, { size: 14, class: 'shrink-0 mt-0.5' });

									var span_1 = $.sibling(node_9, 2);
									var text_7 = $.child(span_1);
									var a_1 = $.sibling(text_7);
									var text_8 = $.only_child(a_1, true);

									$.reset(span_1);
									$.reset(p_1);

									$.template_effect(
										($0, $1) => {
											$.set_text(text_7, `${$0 ?? ''} `);
											$.set_attribute(a_1, 'href', $.get(pendingPr).prUrl);
											$.set_text(text_8, $1);
										},
										[
											() => s('contribute.pendingPrNote'),
											() => s('contribute.pendingPrLink', { number: String($.get(pendingPr).prNumber) })
										]
									);

									$.append($$anchor, p_1);
								};

								$.if(node_8, ($$render) => {
									if ($.get(pendingPr)) $$render(consequent_3);
								});
							}

							var div_4 = $.sibling(node_8, 2);
							var span_2 = $.child(div_4);
							var text_9 = $.only_child(span_2, true);
							var text_10 = $.sibling(span_2);
							var node_10 = $.sibling(text_10);

							{
								var consequent_4 = ($$anchor) => {
									var span_3 = root_4();
									var text_11 = $.only_child(span_3, true);

									$.template_effect(() => $.set_text(text_11, $.get(currentCategoryData).source_language));
									$.append($$anchor, span_3);
								};

								$.if(node_10, ($$render) => {
									if ($.get(currentCategoryData).source_language !== 'en') $$render(consequent_4);
								});
							}

							var node_11 = $.sibling(node_10, 2);

							{
								var consequent_6 = ($$anchor) => {
									var button_3 = root_5();
									var text_12 = $.child(button_3);
									var node_12 = $.sibling(text_12);

									{
										var consequent_5 = ($$anchor) => {
											IconChevronUp($$anchor, { size: 14 });
										};

										var alternate = ($$anchor) => {
											IconChevronDown($$anchor, { size: 14 });
										};

										$.if(node_12, ($$render) => {
											if (showExistingFeeds()) $$render(consequent_5); else $$render(alternate, -1);
										});
									}

									$.reset(button_3);

									$.template_effect(
										($0) => {
											$.set_attribute(button_3, 'aria-expanded', showExistingFeeds());
											$.set_text(text_12, `${$0 ?? ''} `);
										},
										[
											() => showExistingFeeds() ? s('contribute.hideFeeds') : s('contribute.showFeeds')
										]
									);

									$.delegated('click', button_3, () => showExistingFeeds(!showExistingFeeds()));
									$.append($$anchor, button_3);
								};

								$.if(node_11, ($$render) => {
									if ($.get(currentCategoryData).feeds.length > 0) $$render(consequent_6);
								});
							}

							$.reset(div_4);

							var node_13 = $.sibling(div_4, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_5 = root_8();
									var node_14 = $.child(div_5);

									OverlayScrollbarsComponent(node_14, {
										options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } },
										children: ($$anchor, $$slotProps) => {
											var div_6 = root_7();

											$.each(div_6, 21, () => $.get(currentCategoryData).feeds, $.index, ($$anchor, feed) => {
												var div_7 = root_6();
												var text_13 = $.only_child(div_7, true);

												$.template_effect(() => {
													$.set_attribute(div_7, 'title', $.get(feed));
													$.set_text(text_13, $.get(feed));
												});

												$.append($$anchor, div_7);
											});

											$.reset(div_6);
											$.append($$anchor, div_6);
										},
										$$slots: { default: true }
									});

									$.reset(div_5);
									$.append($$anchor, div_5);
								};

								$.if(node_13, ($$render) => {
									if (showExistingFeeds() && $.get(currentCategoryData).feeds.length > 0) $$render(consequent_7);
								});
							}

							$.template_effect(
								($0, $1) => {
									$.set_text(text_9, $0);
									$.set_text(text_10, ` ${$1 ?? ''} `);
								},
								[
									() => s('contribute.feedCount', { count: String($.get(currentCategoryData).feeds.length) }),
									() => s('contribute.inThisCategory')
								]
							);

							$.append($$anchor, fragment_2);
						};

						var consequent_10 = ($$anchor) => {
							const pendingPr = $.derived(() => $.get(pendingPrMap).get(selectedCategory()));
							var fragment_5 = $.comment();
							var node_15 = $.first_child(fragment_5);

							{
								var consequent_9 = ($$anchor) => {
									var p_2 = root_10();
									var node_16 = $.child(p_2);

									IconInfoCircle(node_16, { size: 14, class: 'shrink-0 mt-0.5' });

									var span_4 = $.sibling(node_16, 2);
									var text_14 = $.child(span_4);
									var a_2 = $.sibling(text_14);
									var text_15 = $.only_child(a_2, true);

									$.reset(span_4);
									$.reset(p_2);

									$.template_effect(
										($0, $1) => {
											$.set_text(text_14, `${$0 ?? ''} `);
											$.set_attribute(a_2, 'href', $.get(pendingPr).prUrl);
											$.set_text(text_15, $1);
										},
										[
											() => s('contribute.pendingPrNote'),
											() => s('contribute.pendingPrLink', { number: String($.get(pendingPr).prNumber) })
										]
									);

									$.append($$anchor, p_2);
								};

								$.if(node_15, ($$render) => {
									if ($.get(pendingPr)) $$render(consequent_9);
								});
							}

							$.append($$anchor, fragment_5);
						};

						var d = $.derived(() => selectedCategory() && $.get(pendingPrMap).has(selectedCategory()));

						$.if(node_5, ($$render) => {
							if ($.get(currentCategoryData)) $$render(consequent_8); else if ($.get(d)) $$render(consequent_10, 1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.loadingFeeds) $$render(consequent); else if ($$props.loadError) $$render(consequent_1, 1); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		var alternate_2 = ($$anchor) => {
			var div_8 = root_14();
			var div_9 = $.child(div_8);
			var label_1 = $.child(div_9);
			var text_16 = $.only_child(label_1, true);
			var input = $.sibling(label_1, 2);

			$.remove_input_defaults(input);

			var node_17 = $.sibling(input, 2);

			{
				var consequent_12 = ($$anchor) => {
					var p_3 = root_12();
					var text_17 = $.child(p_3);
					var button_4 = $.sibling(text_17);
					var text_18 = $.only_child(button_4, true);

					$.reset(p_3);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_17, `${$0 ?? ''} `);
							$.set_text(text_18, $1);
						},
						[
							() => s('contribute.categoryExists'),
							() => s('contribute.switchToIt')
						]
					);

					$.delegated('click', button_4, () => {
						mode('existing');
						selectedCategory(newCategoryName().trim());
						newCategoryName('');
					});

					$.append($$anchor, p_3);
				};

				var d_1 = $.derived(() => newCategoryName().trim() && $$props.feedsData && $$props.feedsData[newCategoryName().trim()]);

				$.if(node_17, ($$render) => {
					if ($.get(d_1)) $$render(consequent_12);
				});
			}

			var node_18 = $.sibling(node_17, 2);

			{
				var consequent_13 = ($$anchor) => {
					var p_4 = root_13();
					var node_19 = $.child(p_4);

					IconAlertTriangle(node_19, { size: 14, class: 'shrink-0 mt-0.5' });

					var span_5 = $.sibling(node_19, 2);
					var text_19 = $.only_child(span_5, true);

					$.reset(p_4);
					$.template_effect(($0) => $.set_text(text_19, $0), [() => s('contribute.languageInNameWarning')]);
					$.append($$anchor, p_4);
				};

				$.if(node_18, ($$render) => {
					if ($.get(hasLanguageInName)) $$render(consequent_13);
				});
			}

			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var div_11 = $.child(div_10);
			var label_2 = $.child(div_11);
			var text_20 = $.only_child(label_2, true);
			var node_20 = $.sibling(label_2, 2);

			{
				let $0 = $.derived(() => s('contribute.feedLanguageTooltip'));

				Tooltip(node_20, {
					get text() {
						return $.get($0);
					},
					position: 'top',
					children: ($$anchor, $$slotProps) => {
						IconInfoCircle($$anchor, {
							size: 14,
							class: 'text-primary-400 hover:text-primary-600 cursor-help'
						});
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_11);

			var node_21 = $.sibling(div_11, 2);

			{
				let $0 = $.derived(() => s('contribute.feedLanguage'));

				Select(node_21, {
					get value() {
						return newCategoryLanguage();
					},

					get options() {
						return LANGUAGES;
					},
					onChange: (v) => newCategoryLanguage(v),
					id: 'new-category-lang',
					get label() {
						return $.get($0);
					},
					hideLabel: true
				});
			}

			$.reset(div_10);
			$.reset(div_8);

			$.template_effect(
				($0, $1, $2) => {
					$.set_text(text_16, $0);
					$.set_attribute(input, 'placeholder', $1);
					$.set_text(text_20, $2);
				},
				[
					() => s('contribute.categoryName'),
					() => s('contribute.categoryNamePlaceholder'),
					() => s('contribute.feedLanguage')
				]
			);

			$.bind_value(input, newCategoryName);
			$.append($$anchor, div_8);
		};

		$.if(node, ($$render) => {
			if (mode() === 'existing') $$render(consequent_11); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, $0);
			$.set_attribute(button, 'aria-pressed', mode() === 'existing');

			$.set_class(button, 1, `px-3 py-1.5 text-sm rounded-md transition-colors ${mode() === 'existing'
				? 'bg-blue-600 text-white'
				: 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`);

			$.set_text(text_1, $1);
			$.set_attribute(button_1, 'aria-pressed', mode() === 'new');

			$.set_class(button_1, 1, `px-3 py-1.5 text-sm rounded-md transition-colors ${mode() === 'new'
				? 'bg-blue-600 text-white'
				: 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`);

			$.set_text(text_2, $2);
		},
		[
			() => s('contribute.step1'),
			() => s('contribute.existingCategory'),
			() => s('contribute.newCategory')
		]
	);

	$.delegated('click', button, () => $$props.onModeChange('existing'));
	$.delegated('click', button_1, () => $$props.onModeChange('new'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);