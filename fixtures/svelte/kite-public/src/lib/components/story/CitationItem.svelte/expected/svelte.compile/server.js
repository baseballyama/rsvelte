import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import FaviconImage from '$lib/components/common/FaviconImage.svelte';
import { getTimeAgo } from '$lib/utils/getTimeAgo';

export default function CitationItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Array of highlighted citation numbers
		// Story-specific localization function
		let {
			item,
			highlightedNumbers = [],
			isMobile = false,
			storyLocalizer = s
		} = $$props;

		const isHighlighted = $.derived(() => item.isCommon
			? highlightedNumbers.includes(-1)
			: highlightedNumbers.includes(item.number));

		const badgeClasses = $.derived(() => isHighlighted()
			? 'bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100'
			: item.isCommon
				? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
				: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200');

		const containerClasses = $.derived(() => isHighlighted() ? 'bg-yellow-50 dark:bg-yellow-900 rounded p-1' : '');
		const paddingClasses = $.derived(() => isMobile ? 'px-2 py-1' : 'px-1.5 py-0.5');
		const spacingClasses = $.derived(() => isMobile ? 'space-x-3' : 'space-x-2');
		const textSizeClasses = $.derived(() => isMobile ? '' : 'text-xs');
		const iconSizeClasses = $.derived(() => isMobile ? 'size-4' : 'size-3');
		const marginClasses = $.derived(() => isMobile ? 'ms-12 mb-4' : 'ms-8 mb-2');
		const linkClasses = $.derived(() => isMobile ? 'font-medium' : 'line-clamp-2 text-xs');
		const dateClasses = $.derived(() => isMobile ? 'mt-1' : 'mt-0.5 text-xs');

		if (item.isCommon) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`flex items-start ${spacingClasses()} ${textSizeClasses()} ${containerClasses()}`, 'svelte-1niqr00')} data-citation-number="-1"><span${$.attr_class(`citation-number-badge rounded ${paddingClasses()} font-medium flex-shrink-0 leading-none ${badgeClasses()}`, 'svelte-1niqr00')}>[*]</span> <div class="flex-1"><div${$.attr_class(`font-medium text-gray-700 dark:text-gray-300 ${isMobile ? 'mb-2' : 'mb-1'}`)}>${$.escape(storyLocalizer("citation.commonKnowledge.title") || "Common Knowledge")}</div> <div${$.attr_class(`text-gray-600 dark:text-gray-400 ${isMobile ? 'leading-relaxed' : 'text-xs leading-relaxed'}`)}>${$.escape(storyLocalizer("citation.commonKnowledge.description") || "This information is common knowledge not pulled from a specific news source, but is included for context and completeness of the story.")}</div></div></div>`);
		} else if (item.article) {
			$$renderer.push(`<!--[1--><div${$.attr_class(`flex items-center ${spacingClasses()} ${textSizeClasses()} ${containerClasses()}`, 'svelte-1niqr00')}${$.attr('data-citation-number', item.number)}><span${$.attr_class(`citation-number-badge rounded ${paddingClasses()} font-medium flex-shrink-0 leading-none ${badgeClasses()}`, 'svelte-1niqr00')}>[${$.escape(item.number)}]</span> <div${$.attr_class(`flex items-center ${spacingClasses()} flex-1 min-w-0`, 'svelte-1niqr00')}>`);

			FaviconImage($$renderer, {
				domain: item.article.domain,
				alt: `${$.stringify(item.article.domain)} favicon`,
				class: `${iconSizeClasses()} rounded-sm flex-shrink-0`,
				loading: 'lazy'
			});

			$$renderer.push(`<!----> <span class="font-medium text-gray-700 dark:text-gray-300 truncate leading-none">${$.escape(item.article.domain)}</span></div></div> <div${$.attr_class($.clsx(marginClasses()), 'svelte-1niqr00')}><a${$.attr('href', item.article.link)} target="_blank" rel="noopener noreferrer"${$.attr_class(`text-gray-600 dark:text-gray-400 hover:underline ${linkClasses()} block`, 'svelte-1niqr00')}${$.attr('title', item.article.title)}>${$.escape(item.article.title)}</a> `);

			if (item.article.date) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`text-gray-500 dark:text-gray-400 ${dateClasses()}`, 'svelte-1niqr00')}>${$.escape(getTimeAgo(item.article.date))}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}