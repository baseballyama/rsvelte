import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import FaviconImage from '$lib/components/common/FaviconImage.svelte';
import { getTimeAgo } from '$lib/utils/getTimeAgo';

var root = $.from_html(`<div data-citation-number="-1"><span>[*]</span> <div class="flex-1"><div> </div> <div> </div></div></div>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<div><span> </span> <div><!> <span class="font-medium text-gray-700 dark:text-gray-300 truncate leading-none"> </span></div></div> <div><a target="_blank" rel="noopener noreferrer"> </a> <!></div>`, 1);

export default function CitationItem($$anchor, $$props) {
	$.push($$props, true);

	// Array of highlighted citation numbers
	// Story-specific localization function
	let highlightedNumbers = $.prop($$props, 'highlightedNumbers', 19, () => []),
		isMobile = $.prop($$props, 'isMobile', 3, false),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s);

	const isHighlighted = $.derived(() => $$props.item.isCommon
		? highlightedNumbers().includes(-1)
		: highlightedNumbers().includes($$props.item.number));

	const badgeClasses = $.derived(() => $.get(isHighlighted)
		? 'bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100'
		: $$props.item.isCommon
			? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
			: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200');

	const containerClasses = $.derived(() => $.get(isHighlighted) ? 'bg-yellow-50 dark:bg-yellow-900 rounded p-1' : '');
	const paddingClasses = $.derived(() => isMobile() ? 'px-2 py-1' : 'px-1.5 py-0.5');
	const spacingClasses = $.derived(() => isMobile() ? 'space-x-3' : 'space-x-2');
	const textSizeClasses = $.derived(() => isMobile() ? '' : 'text-xs');
	const iconSizeClasses = $.derived(() => isMobile() ? 'size-4' : 'size-3');
	const marginClasses = $.derived(() => isMobile() ? 'ms-12 mb-4' : 'ms-8 mb-2');
	const linkClasses = $.derived(() => isMobile() ? 'font-medium' : 'line-clamp-2 text-xs');
	const dateClasses = $.derived(() => isMobile() ? 'mt-1' : 'mt-0.5 text-xs');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var span = $.child(div);
			var div_1 = $.sibling(span, 2);
			var div_2 = $.child(div_1);
			var text = $.only_child(div_2, true);
			var div_3 = $.sibling(div_2, 2);
			var text_1 = $.only_child(div_3, true);

			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0, $1) => {
					$.set_class(div, 1, `flex items-start ${$.get(spacingClasses) ?? ''} ${$.get(textSizeClasses) ?? ''} ${$.get(containerClasses) ?? ''}`, 'svelte-1niqr00');
					$.set_class(span, 1, `citation-number-badge rounded ${$.get(paddingClasses) ?? ''} font-medium flex-shrink-0 leading-none ${$.get(badgeClasses) ?? ''}`, 'svelte-1niqr00');
					$.set_class(div_2, 1, `font-medium text-gray-700 dark:text-gray-300 ${isMobile() ? 'mb-2' : 'mb-1'}`);
					$.set_text(text, $0);
					$.set_class(div_3, 1, `text-gray-600 dark:text-gray-400 ${isMobile() ? 'leading-relaxed' : 'text-xs leading-relaxed'}`);
					$.set_text(text_1, $1);
				},
				[
					() => storyLocalizer()("citation.commonKnowledge.title") || "Common Knowledge",
					() => storyLocalizer()("citation.commonKnowledge.description") || "This information is common knowledge not pulled from a specific news source, but is included for context and completeness of the story."
				]
			);

			$.append($$anchor, div);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_2();
			var div_4 = $.first_child(fragment_1);
			var span_1 = $.child(div_4);
			var text_2 = $.only_child(span_1);
			var div_5 = $.sibling(span_1, 2);
			var node_1 = $.child(div_5);

			FaviconImage(node_1, {
				get domain() {
					return $$props.item.article.domain;
				},

				get alt() {
					return `${$$props.item.article.domain ?? ''} favicon`;
				},

				get class() {
					return `${$.get(iconSizeClasses) ?? ''} rounded-sm flex-shrink-0`;
				},
				loading: 'lazy'
			});

			var span_2 = $.sibling(node_1, 2);
			var text_3 = $.only_child(span_2, true);

			$.reset(div_5);
			$.reset(div_4);

			var div_6 = $.sibling(div_4, 2);
			var a = $.child(div_6);
			var text_4 = $.only_child(a, true);
			var node_2 = $.sibling(a, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_7 = root_1();
					var text_5 = $.only_child(div_7, true);

					$.template_effect(
						($0) => {
							$.set_class(div_7, 1, `text-gray-500 dark:text-gray-400 ${$.get(dateClasses) ?? ''}`, 'svelte-1niqr00');
							$.set_text(text_5, $0);
						},
						[() => getTimeAgo($$props.item.article.date)]
					);

					$.append($$anchor, div_7);
				};

				$.if(node_2, ($$render) => {
					if ($$props.item.article.date) $$render(consequent_1);
				});
			}

			$.reset(div_6);

			$.template_effect(() => {
				$.set_class(div_4, 1, `flex items-center ${$.get(spacingClasses) ?? ''} ${$.get(textSizeClasses) ?? ''} ${$.get(containerClasses) ?? ''}`, 'svelte-1niqr00');
				$.set_attribute(div_4, 'data-citation-number', $$props.item.number);
				$.set_class(span_1, 1, `citation-number-badge rounded ${$.get(paddingClasses) ?? ''} font-medium flex-shrink-0 leading-none ${$.get(badgeClasses) ?? ''}`, 'svelte-1niqr00');
				$.set_text(text_2, `[${$$props.item.number ?? ''}]`);
				$.set_class(div_5, 1, `flex items-center ${$.get(spacingClasses) ?? ''} flex-1 min-w-0`, 'svelte-1niqr00');
				$.set_text(text_3, $$props.item.article.domain);
				$.set_class(div_6, 1, $.clsx($.get(marginClasses)), 'svelte-1niqr00');
				$.set_attribute(a, 'href', $$props.item.article.link);
				$.set_class(a, 1, `text-gray-600 dark:text-gray-400 hover:underline ${$.get(linkClasses) ?? ''} block`, 'svelte-1niqr00');
				$.set_attribute(a, 'title', $$props.item.article.title);
				$.set_text(text_4, $$props.item.article.title);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.item.isCommon) $$render(consequent); else if ($$props.item.article) $$render(consequent_2, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}