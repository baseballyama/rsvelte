import * as $ from 'svelte/internal/server';

import {
	IconAlertTriangle,
	IconChevronDown,
	IconChevronUp,
	IconCircleCheck,
	IconCircleX,
	IconLoader2,
	IconPlus,
	IconQuestionMark,
	IconTrash,
	IconX
} from '@tabler/icons-svelte';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
import { s } from '$lib/client/localization.svelte';

export default function ContributeFeedStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			addedFeeds,
			duplicateFeeds,
			validFeeds,
			errorFeeds,
			unknownFeeds,
			pendingFeeds,
			allErrored,
			parseError,
			onAddFeeds,
			onRemoveFeed,
			onRemoveAllErrored
		} = $$props;

		let feedUrlsInput = '';
		let showDuplicates = false;

		// Auto-expand duplicates section when new duplicates are added
		let prevDuplicateCount = 0;

		function handleKeydown(e) {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleAdd();
			}
		}

		function handleAdd() {
			if (!feedUrlsInput.trim()) return;

			if (onAddFeeds(feedUrlsInput)) {
				feedUrlsInput = '';
			}
		}

		$$renderer.push(`<div class="bg-modal-bg rounded-lg border border-primary-200 p-5"><h2 class="text-base font-semibold text-primary mb-4">${$.escape(s('contribute.step2'))}</h2> <div class="space-y-3"><div><textarea${$.attr('placeholder', s('contribute.feedInputPlaceholder'))}${$.attr('aria-label', s('contribute.step2'))} rows="3"${$.attr_class(`w-full px-3 py-2 border rounded-lg bg-input-bg text-primary placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-focus-ring text-sm font-mono resize-y ${parseError
			? 'border-red-300 dark:border-red-600'
			: 'border-primary-300'}`)}>`);

		const $$body = $.escape(feedUrlsInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> `);

		if (parseError) {
			$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-red-600 dark:text-red-400">${$.escape(parseError)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <button${$.attr('disabled', !feedUrlsInput.trim(), true)} class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-primary-200 disabled:dark:bg-primary-700 text-white disabled:text-primary-500 disabled:dark:text-primary-400 disabled:cursor-not-allowed">`);
		IconPlus($$renderer, { size: 16 });
		$$renderer.push(`<!----> ${$.escape(s('contribute.addFeeds'))}</button> `);

		if (duplicateFeeds.length > 0) {
			$$renderer.push(`<!--[0--><div class="text-xs text-amber-600 dark:text-amber-400"><button${$.attr('aria-expanded', showDuplicates)} class="flex items-center gap-1.5 hover:underline">`);
			IconAlertTriangle($$renderer, { size: 14, class: 'shrink-0' });
			$$renderer.push(`<!----> <span>${$.escape(s('contribute.duplicatesSkipped', { count: String(duplicateFeeds.length) }))}</span> `);

			if (showDuplicates) {
				$$renderer.push('<!--[0-->');
				IconChevronUp($$renderer, { size: 12 });
			} else {
				$$renderer.push('<!--[-1-->');
				IconChevronDown($$renderer, { size: 12 });
			}

			$$renderer.push(`<!--]--></button> `);

			if (showDuplicates) {
				$$renderer.push(`<!--[0--><div class="mt-1.5 ml-5 space-y-0.5 text-[11px] font-mono text-amber-500 dark:text-amber-500"><!--[-->`);

				const each_array = $.ensure_array_like(duplicateFeeds);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let url = each_array[$$index];

					$$renderer.push(`<div class="truncate"${$.attr('title', url)}>${$.escape(url)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (addedFeeds.length > 0) {
			$$renderer.push(`<!--[0--><div class="mt-4"><div class="flex items-center justify-between mb-2"><div class="text-xs text-primary-600" aria-live="polite">${$.escape(s('contribute.feedsAdded', { count: String(addedFeeds.length) }))} `);

			if (validFeeds.length > 0) {
				$$renderer.push(`<!--[0-->— <span class="text-green-600 dark:text-green-400">${$.escape(s('contribute.validCount', { count: String(validFeeds.length) }))}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (unknownFeeds.length > 0) {
				$$renderer.push(`<!--[0-->— <span class="text-amber-600 dark:text-amber-400">${$.escape(s('contribute.unverifiedCount', { count: String(unknownFeeds.length) }))}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (errorFeeds.length > 0) {
				$$renderer.push(`<!--[0-->— <span class="text-red-600 dark:text-red-400">${$.escape(s('contribute.errorCount', { count: String(errorFeeds.length) }))}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (pendingFeeds.length > 0) {
				$$renderer.push(`<!--[0-->— <span class="text-gray-500">${$.escape(s('contribute.checkingCount', { count: String(pendingFeeds.length) }))}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (errorFeeds.length > 0) {
				$$renderer.push(`<!--[0--><button class="text-[11px] text-red-500 dark:text-red-400 hover:underline inline-flex items-center gap-1">`);
				IconTrash($$renderer, { size: 12 });
				$$renderer.push(`<!----> ${$.escape(s('contribute.removeErrored', { count: String(errorFeeds.length) }))}</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div style="max-height: 18rem;">`);

			OverlayScrollbarsComponent($$renderer, {
				options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } },
				children: ($$renderer) => {
					$$renderer.push(`<div class="space-y-1" style="max-height: 18rem;"><!--[-->`);

					const each_array_1 = $.ensure_array_like(addedFeeds);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let feed = each_array_1[$$index_1];

						$$renderer.push(`<div${$.attr_class(`flex items-center gap-2 py-1.5 px-2 rounded-md group ${feed.status === 'error' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-primary-50'}`)}><span class="shrink-0"${$.attr('aria-label', feed.error || feed.status)}${$.attr('title', feed.error || feed.status)}>`);

						if (feed.status === 'checking') {
							$$renderer.push('<!--[0-->');
							IconLoader2($$renderer, { size: 16, class: 'animate-spin text-gray-400' });
						} else if (feed.status === 'valid') {
							$$renderer.push('<!--[1-->');
							IconCircleCheck($$renderer, { size: 16, class: 'text-green-500' });
						} else if (feed.status === 'error') {
							$$renderer.push('<!--[2-->');
							IconCircleX($$renderer, { size: 16, class: 'text-red-500' });
						} else if (feed.status === 'unknown') {
							$$renderer.push('<!--[3-->');
							IconQuestionMark($$renderer, { size: 16, class: 'text-amber-500' });
						} else {
							$$renderer.push(`<!--[-1--><div class="w-4 h-4 rounded-full border-2 border-primary-300"></div>`);
						}

						$$renderer.push(`<!--]--></span> <span${$.attr_class(`flex-1 text-xs font-mono truncate ${feed.status === 'error'
							? 'text-red-600 dark:text-red-400 line-through'
							: 'text-primary-700'}`)}${$.attr('title', feed.url)}>${$.escape(feed.url)}</span> `);

						if (feed.error && feed.status !== 'valid') {
							$$renderer.push(`<!--[0--><span class="text-[10px] text-primary-400 hidden sm:inline truncate max-w-40"${$.attr('title', feed.error)}>${$.escape(feed.error)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <button class="shrink-0 p-0.5 text-primary-400 hover:text-red-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity"${$.attr('aria-label', s('contribute.removeFeed'))}>`);
						IconX($$renderer, { size: 14 });
						$$renderer.push(`<!----></button></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (allErrored) {
				$$renderer.push(`<!--[0--><div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"><div class="flex items-start gap-2">`);
				IconCircleX($$renderer, { size: 16, class: 'shrink-0 mt-0.5 text-red-500' });
				$$renderer.push(`<!----> <p class="text-xs text-red-700 dark:text-red-300">${$.escape(s('contribute.allFeedsFailed'))}</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}