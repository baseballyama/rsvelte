import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { s } from '$lib/client/localization.svelte';
import { languageSettings } from '$lib/data/settings.svelte.js';
import { UrlNavigationService } from '$lib/services/urlNavigationService';
import ReportButton from '../ReportButton.svelte';
import ShareButton from '../ShareButton.svelte';

export default function StoryActions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			story,
			onClose,
			batchId,
			batchDateSlug = null,
			categoryId,
			storyIndex,
			isSharedView = false,
			storyLocalizer = s // Use regular localization if not provided
		} = $$props;

		// Get current navigation params from URL if not provided
		const navigationParams = $.derived(() => {
			if (batchId && categoryId && storyIndex !== undefined) {
				return {
					batchId,
					categoryId,
					storyIndex,
					dataLang: languageSettings.data
				};
			}

			// Fall back to parsing from current URL
			const params = UrlNavigationService.parseUrl(page.url);

			return {
				batchId: params.batchId || batchId,
				categoryId: params.categoryId || categoryId,
				storyIndex: params.storyIndex ?? storyIndex,
				dataLang: params.dataLang || languageSettings.data
			};
		});

		$$renderer.push(`<div class="order-last mt-6 flex w-full items-center justify-center md:px-0"><div class="flex-1 flex justify-start gap-2">`);

		ShareButton($$renderer, {
			title: story.title,
			description: story.short_summary,
			batchId: navigationParams().batchId || '',
			categoryId: navigationParams().categoryId || '',
			storyIndex: navigationParams().storyIndex,
			clusterId: story.cluster_number,
			languageCode: navigationParams().dataLang,
			class: 'text-gray-600 transition-all duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
		});

		$$renderer.push(`<!----> `);

		if (story.id) {
			$$renderer.push('<!--[0-->');

			ReportButton($$renderer, {
				clusterId: story.id,
				title: story.title,
				class: 'text-gray-600 transition-all duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!isSharedView) {
			$$renderer.push(`<!--[0--><button${$.attr('aria-label', storyLocalizer("article.closeStory.aria") || "Close story and return to category list")} class="focus:ring-opacity-75 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 focus:outline-none">${$.escape(storyLocalizer("article.closeStory") || "Close")}</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex-1"></div></div>`);
	});
}