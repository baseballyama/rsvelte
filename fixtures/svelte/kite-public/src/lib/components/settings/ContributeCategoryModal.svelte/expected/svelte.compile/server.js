import * as $ from 'svelte/internal/server';

import {
	IconAlertTriangle,
	IconBrandGithub,
	IconCheck,
	IconExternalLink,
	IconRss,
	IconX
} from '@tabler/icons-svelte';

import { fade, scale } from 'svelte/transition';
import Portal from 'svelte-portal';
import { s } from '$lib/client/localization.svelte';
import { createModalBehavior } from '$lib/utils/modalBehavior.svelte';
import { scrollLock } from '$lib/utils/scrollLock.js';

export default function ContributeCategoryModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { visible, onClose } = $$props;
		const modal = createModalBehavior();
		let dialogElement = undefined;
		let closeButtonRef = undefined;
		let previousActiveElement = null;

		// Handle keyboard events
		function handleKeydown(e) {
			if (e.key === 'Escape') {
				onClose();

				return;
			}

			// Focus trap
			if (e.key === 'Tab' && dialogElement) {
				const focusableElements = Array.from(dialogElement.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex="0"]'));

				if (focusableElements.length === 0) return;

				const first = focusableElements[0];
				const last = focusableElements[focusableElements.length - 1];

				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		}

		// Manage focus and scroll lock
		// Pre-filled issue URL for category suggestions (fallback)
		const ISSUE_URL = 'https://github.com/kagisearch/kite-public/issues/new?labels=category&title=New+Category+Suggestion:+[Category+Name]&body=' + encodeURIComponent(`## Category Name
<!-- Replace with your category name, e.g., "Aviation", "South Korea", "Climate" -->


## Description
<!-- Brief description of what this category covers -->


## RSS Feeds
<!--
Guidelines:
- 25+ feeds required, but more is always better
- No need for "balance" \u2014 a left-wing source doesn\u2019t need a right-wing counterpart
  State media, partisan outlets, all fine. Our system corroborates facts across sources.
- No conspiracy content \u2014 no fabricated claims, event denial, or hoax content
-->

1.
2.
3.
<!-- Add more feeds... -->

`);

		const FEEDS_FILE_URL = 'https://github.com/kagisearch/kite-public/blob/main/kite_feeds.json';

		if (visible) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="fixed inset-0 z-modal flex items-center justify-center bg-black/60 dark:bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="contribute-title" tabindex="-1"><div class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden" role="document"><div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 id="contribute-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">${$.escape(s("settings.categories.contribute.title") || "Contribute a Category")}</h2> <button class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible-ring"${$.attr('aria-label', s("ui.close") || "Close")}>`);
					IconX($$renderer, { size: 20 });
					$$renderer.push(`<!----></button></div> <div class="p-5 space-y-5"><p class="text-sm text-gray-600 dark:text-gray-400">${$.escape(s("settings.categories.contribute.intro") || "Help expand Kagi News coverage by suggesting new categories. Community contributions are what make Kagi News diverse and comprehensive.")}</p> <div class="space-y-3"><h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s("settings.categories.contribute.requirements") || "Guidelines:")}</h3> <ul class="space-y-2.5"><li class="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">`);
					IconRss($$renderer, { size: 18, class: 'shrink-0 mt-0.5 text-blue-500' });
					$$renderer.push(`<!----> <span><strong class="text-gray-900 dark:text-gray-200">${$.escape(s("settings.categories.contribute.req1Title") || "25+ RSS feeds (more is better)")}</strong>  ${$.escape(s("settings.categories.contribute.req1Desc") || "\u2014 the more high-quality feeds, the better the coverage")}</span></li> <li class="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">`);
					IconCheck($$renderer, { size: 18, class: 'shrink-0 mt-0.5 text-green-500' });
					$$renderer.push(`<!----> <span><strong class="text-gray-900 dark:text-gray-200">${$.escape(s("settings.categories.contribute.req2Title") || "No need for \"balance\"")}</strong>  ${$.escape(s("settings.categories.contribute.req2Desc") || "\u2014 a left-wing source doesn\u2019t need a right-wing counterpart. State media, partisan outlets, all fine. Our system corroborates facts across multiple sources, so outliers can\u2019t skew the output. This is also why more sources = better")}</span></li> <li class="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">`);
					IconAlertTriangle($$renderer, { size: 18, class: 'shrink-0 mt-0.5 text-amber-500' });
					$$renderer.push(`<!----> <span><strong class="text-gray-900 dark:text-gray-200">${$.escape(s("settings.categories.contribute.req3Title") || "No conspiracy content")}</strong>  ${$.escape(s("settings.categories.contribute.req3Desc") || "\u2014 no fabricated claims, event denial, or hoax content")}</span></li></ul></div> <div class="space-y-3 pt-2"><a href="/contribute" class="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus-visible-ring">`);
					IconRss($$renderer, { size: 18 });
					$$renderer.push(`<!----> ${$.escape(s("settings.categories.contribute.suggestButton") || "Suggest a Category")}</a> <p class="text-xs text-center text-gray-500 dark:text-gray-500">${$.escape(s("settings.categories.contribute.suggestHint") || "Add feeds interactively with validation and automatic PR creation")}</p></div> <div class="relative"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200 dark:border-gray-700"></div></div> <div class="relative flex justify-center text-xs"><span class="px-2 bg-white dark:bg-gray-800 text-gray-500">${$.escape(s("settings.categories.contribute.or") || "or")}</span></div></div> <div class="text-center space-y-2"><a${$.attr('href', ISSUE_URL)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus-visible-ring rounded">`);
					IconBrandGithub($$renderer, { size: 14 });
					$$renderer.push(`<!----> ${$.escape(s("settings.categories.contribute.openIssue") || "Open a GitHub issue")} `);
					IconExternalLink($$renderer, { size: 14 });
					$$renderer.push(`<!----></a> <span class="mx-2 text-gray-300 dark:text-gray-600">|</span> <a${$.attr('href', FEEDS_FILE_URL)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus-visible-ring rounded">${$.escape(s("settings.categories.contribute.prLink") || "Submit a PR directly")} `);
					IconExternalLink($$renderer, { size: 14 });
					$$renderer.push(`<!----></a></div></div></div></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}