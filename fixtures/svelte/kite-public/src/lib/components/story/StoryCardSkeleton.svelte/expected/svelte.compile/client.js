import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<article class="relative py-2 border-b border-gray-200 dark:border-gray-700 animate-pulse"><header class="mb-1 flex items-center justify-between"><div class="flex items-center gap-2"><div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></div></header> <div class="flex items-start"><div class="flex-grow"><div class="mb-2"><div></div></div></div> <div class="-mt-3 ms-4 flex-shrink-0"><div class="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div></div></div></article>`);

export default function StoryCardSkeleton($$anchor, $$props) {
	// Optional prop to vary the title width for visual interest
	let variant = $.prop($$props, 'variant', 3, 0);

	// Different title widths to make it look more natural
	const titleWidths = ['w-4/5', 'w-3/4', 'w-5/6', 'w-2/3', 'w-11/12', 'w-3/5'];

	const titleWidth = $.derived(() => titleWidths[variant() % titleWidths.length]);
	var article = root();
	var div = $.sibling($.child(article), 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.only_child(div_2);

	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.reset(article);
	$.template_effect(() => $.set_class(div_3, 1, `h-6 ${$.get(titleWidth) ?? ''} bg-gray-200 dark:bg-gray-700 rounded`));
	$.append($$anchor, article);
}