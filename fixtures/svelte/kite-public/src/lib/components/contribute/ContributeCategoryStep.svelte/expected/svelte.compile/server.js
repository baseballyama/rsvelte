import * as $ from 'svelte/internal/server';

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

export default function ContributeCategoryStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			mode = void 0,
			feedsData,
			loadingFeeds,
			loadError,
			pendingPrs,
			selectedCategory = void 0,
			newCategoryName = void 0,
			newCategoryLanguage = void 0,
			showExistingFeeds = void 0,
			onModeChange,
			onCategoryChange,
			onLoadRetry
		} = $$props;

		// Detect language codes in category name like "Switzerland (IT)" or "Japan (EN)"
		const LANG_CODE_PATTERN = /\s*\(\s*(?:EN|DE|ES|FR|IT|JA|PT|AR|HE|HI|KO|NL|RU|UK|ET|ZH)\s*\)\s*$/i;

		const hasLanguageInName = $.derived(() => LANG_CODE_PATTERN.test(newCategoryName.trim()));

		// Build a map of category names that have pending PRs
		const pendingPrMap = $.derived(() => new Map(pendingPrs.map((pr) => [pr.categoryName, pr])));

		const categoryOptions = $.derived(() => feedsData
			? Object.entries(feedsData).map(([name, data]) => {
				const isCore = data.category_type === 'core';
				const pendingPr = pendingPrMap().get(name);
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
		const pendingOnlyOptions = $.derived(() => pendingPrs.filter((pr) => pr.isNew && feedsData && !feedsData[pr.categoryName]).map((pr) => ({
			value: pr.categoryName,
			label: `${pr.categoryName} (${s('contribute.pendingPr')} · ${s('contribute.pendingFeedCount', { count: String(pr.feedCount) })})`
		})));

		const allCategoryOptions = $.derived(() => [
			...categoryOptions(),
			...pendingOnlyOptions().length > 0
				? [
					{
						value: '',
						label: `── ${s('contribute.pendingPr')} ──`,
						disabled: true
					},
					...pendingOnlyOptions()
				]
				: []
		]);

		const currentCategoryData = $.derived(() => feedsData && selectedCategory ? feedsData[selectedCategory] : null);

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

		$$renderer.push(`<div class="bg-modal-bg rounded-lg border border-primary-200 p-5"><h2 class="text-base font-semibold text-primary mb-4">${$.escape(s('contribute.step1'))}</h2> <div class="flex gap-2 mb-4"><button${$.attr('aria-pressed', mode === 'existing')}${$.attr_class(`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === 'existing'
			? 'bg-blue-600 text-white'
			: 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`)}>${$.escape(s('contribute.existingCategory'))}</button> <button${$.attr('aria-pressed', mode === 'new')}${$.attr_class(`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === 'new'
			? 'bg-blue-600 text-white'
			: 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`)}>${$.escape(s('contribute.newCategory'))}</button></div> `);

		if (mode === 'existing') {
			$$renderer.push('<!--[0-->');

			if (loadingFeeds) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2 text-sm text-primary-600">`);
				IconLoader2($$renderer, { size: 16, class: 'animate-spin' });
				$$renderer.push(`<!----> ${$.escape(s('contribute.loadingCategories'))}</div>`);
			} else if (loadError) {
				$$renderer.push(`<!--[1--><div class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">`);
				IconCircleX($$renderer, { size: 16 });
				$$renderer.push(`<!----> ${$.escape(loadError)} <button class="text-accent-links hover:underline">${$.escape(s('contribute.retry'))}</button></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				Select($$renderer, {
					value: selectedCategory,
					options: allCategoryOptions(),
					placeholder: s('contribute.searchCategories'),
					searchable: true,
					onChange: onCategoryChange,
					id: 'category-select',
					label: s('contribute.existingCategory'),
					hideLabel: true
				});

				$$renderer.push(`<!----> `);

				if (currentCategoryData()) {
					$$renderer.push('<!--[0-->');

					const isCore = currentCategoryData().category_type === 'core';
					const pendingPr = pendingPrMap().get(selectedCategory);

					if (isCore) {
						$$renderer.push(`<!--[0--><p class="mt-3 text-xs text-primary-500 flex items-start gap-1.5">`);
						IconInfoCircle($$renderer, { size: 14, class: 'shrink-0 mt-0.5' });
						$$renderer.push(`<!----> <span>${$.escape(s('contribute.coreCategoryNote'))}</span></p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (pendingPr) {
						$$renderer.push(`<!--[0--><p class="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">`);
						IconInfoCircle($$renderer, { size: 14, class: 'shrink-0 mt-0.5' });
						$$renderer.push(`<!----> <span>${$.escape(s('contribute.pendingPrNote'))} <a${$.attr('href', pendingPr.prUrl)} target="_blank" rel="noopener noreferrer" class="text-accent-links hover:underline">${$.escape(s('contribute.pendingPrLink', { number: String(pendingPr.prNumber) }))}</a></span></p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="mt-3 text-sm text-primary-600"><span class="font-medium text-primary">${$.escape(s('contribute.feedCount', { count: String(currentCategoryData().feeds.length) }))}</span> ${$.escape(s('contribute.inThisCategory'))} `);

					if (currentCategoryData().source_language !== 'en') {
						$$renderer.push(`<!--[0--><span class="ml-2 px-1.5 py-0.5 bg-primary-100 rounded text-xs">${$.escape(currentCategoryData().source_language)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (currentCategoryData().feeds.length > 0) {
						$$renderer.push(`<!--[0--><button${$.attr('aria-expanded', showExistingFeeds)} class="ml-2 text-accent-links hover:underline inline-flex items-center gap-0.5">${$.escape(showExistingFeeds ? s('contribute.hideFeeds') : s('contribute.showFeeds'))} `);

						if (showExistingFeeds) {
							$$renderer.push('<!--[0-->');
							IconChevronUp($$renderer, { size: 14 });
						} else {
							$$renderer.push('<!--[-1-->');
							IconChevronDown($$renderer, { size: 14 });
						}

						$$renderer.push(`<!--]--></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					if (showExistingFeeds && currentCategoryData().feeds.length > 0) {
						$$renderer.push(`<!--[0--><div class="mt-2 bg-primary-50 rounded-md" style="max-height: 12rem;">`);

						OverlayScrollbarsComponent($$renderer, {
							options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } },
							children: ($$renderer) => {
								$$renderer.push(`<div class="p-3 text-xs font-mono space-y-0.5" style="max-height: 12rem;"><!--[-->`);

								const each_array = $.ensure_array_like(currentCategoryData().feeds);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let feed = each_array[$$index];

									$$renderer.push(`<div class="text-primary-600 truncate"${$.attr('title', feed)}>${$.escape(feed)}</div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else if (selectedCategory && pendingPrMap().has(selectedCategory)) {
					$$renderer.push('<!--[1-->');

					const pendingPr = pendingPrMap().get(selectedCategory);

					if (pendingPr) {
						$$renderer.push(`<!--[0--><p class="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">`);
						IconInfoCircle($$renderer, { size: 14, class: 'shrink-0 mt-0.5' });
						$$renderer.push(`<!----> <span>${$.escape(s('contribute.pendingPrNote'))} <a${$.attr('href', pendingPr.prUrl)} target="_blank" rel="noopener noreferrer" class="text-accent-links hover:underline">${$.escape(s('contribute.pendingPrLink', { number: String(pendingPr.prNumber) }))}</a></span></p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div class="space-y-3"><div><label for="new-category-name" class="block text-sm font-medium text-primary-700 mb-1">${$.escape(s('contribute.categoryName'))}</label> <input id="new-category-name" type="text"${$.attr('value', newCategoryName)}${$.attr('placeholder', s('contribute.categoryNamePlaceholder'))} class="w-full px-3 py-2 border border-primary-300 rounded-lg bg-input-bg text-primary placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-focus-ring text-sm"/> `);

			if (newCategoryName.trim() && feedsData && feedsData[newCategoryName.trim()]) {
				$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-amber-600 dark:text-amber-400">${$.escape(s('contribute.categoryExists'))} <button class="text-accent-links hover:underline">${$.escape(s('contribute.switchToIt'))}</button></p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (hasLanguageInName()) {
				$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">`);
				IconAlertTriangle($$renderer, { size: 14, class: 'shrink-0 mt-0.5' });
				$$renderer.push(`<!----> <span>${$.escape(s('contribute.languageInNameWarning'))}</span></p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div><div class="flex items-center gap-1.5 mb-1"><label for="new-category-lang" class="block text-sm font-medium text-primary-700">${$.escape(s('contribute.feedLanguage'))}</label> `);

			Tooltip($$renderer, {
				text: s('contribute.feedLanguageTooltip'),
				position: 'top',
				children: ($$renderer) => {
					IconInfoCircle($$renderer, {
						size: 14,
						class: 'text-primary-400 hover:text-primary-600 cursor-help'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Select($$renderer, {
				value: newCategoryLanguage,
				options: LANGUAGES,
				onChange: (v) => newCategoryLanguage = v,
				id: 'new-category-lang',
				label: s('contribute.feedLanguage'),
				hideLabel: true
			});

			$$renderer.push(`<!----></div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		$.bind_props($$props, {
			mode,
			selectedCategory,
			newCategoryName,
			newCategoryLanguage,
			showExistingFeeds
		});
	});
}