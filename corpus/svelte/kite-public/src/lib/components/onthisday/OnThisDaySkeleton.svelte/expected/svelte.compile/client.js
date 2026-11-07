import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div class="flex items-center"><span class="relative z-10 h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></span> <div class="ml-2 pl-2 h-7 w-16 rounded bg-gray-200 dark:bg-gray-700"></div></div> <div class="mt-2 pl-6 md:mt-0 md:pl-0 space-y-1.5"><div class="h-3.5 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-3.5 rounded bg-gray-200 dark:bg-gray-700"></div></div></div>`);
var root_1 = $.from_html(`<div class="absolute top-0 right-0 h-full w-[1px] bg-gray-200 dark:bg-gray-700"></div>`);
var root_2 = $.from_html(`<div class="relative flex w-1/3 flex-col items-center px-4 text-center"><!> <div class="mr-auto mb-2 h-7 w-16 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="flex items-start gap-4 w-full"><div class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div> <div class="flex-1 space-y-1.5"><div class="h-3.5 w-full rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-3.5 rounded bg-gray-200 dark:bg-gray-700"></div></div></div></div>`);
var root_3 = $.from_html(`<div class="flex items-start gap-4"><div class="h-7 w-16 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="flex-1 space-y-1.5"><div class="h-3.5 w-full rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-3.5 rounded bg-gray-200 dark:bg-gray-700"></div></div></div>`);
var root_4 = $.from_html(`<div class="animate-pulse" role="status" aria-label="Loading today in history"><div class="mb-8"><div class="mb-4 h-7 w-24 rounded bg-gray-200 dark:bg-gray-700"></div> <!></div> <div><div class="mb-4 h-7 w-20 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="hidden md:flex justify-around"></div> <div class="block md:hidden space-y-4"></div></div></div>`);

export default function OnThisDaySkeleton($$anchor, $$props) {
	$.push($$props, true);

	var div = root_4();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	$.each(node, 16, () => [0, 1, 2, 3, 4], $.index, ($$anchor, _, index) => {
		var div_2 = root();

		$.set_class(div_2, 1, `relative flex flex-col pb-6 before:absolute before:top-[14px] before:bottom-[-16px] before:left-[3px] before:w-[2px] before:bg-gray-200 before:content-[''] dark:before:bg-gray-700 ${index === 4 ? 'last-item' : ''} md:grid md:grid-cols-[auto_1fr] md:items-start md:gap-4`, 'svelte-1t00uz4', {}, { 'last-item': index === 4 });

		var div_3 = $.sibling($.child(div_2), 2);
		var div_4 = $.child(div_3);
		var div_5 = $.sibling(div_4, 2);

		$.reset(div_3);
		$.reset(div_2);

		$.template_effect(() => {
			$.set_style(div_4, `width: ${[95, 80, 90, 70, 85][index] ?? ''}%`);
			$.set_style(div_5, `width: ${[60, 45, 55, 75, 50][index] ?? ''}%`);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var div_7 = $.sibling($.child(div_6), 2);

	$.each(div_7, 20, () => [0, 1, 2], $.index, ($$anchor, _, index) => {
		var div_8 = root_2();
		var node_1 = $.child(div_8);

		{
			var consequent = ($$anchor) => {
				var div_9 = root_1();

				$.append($$anchor, div_9);
			};

			$.if(node_1, ($$render) => {
				if (index < 2) $$render(consequent);
			});
		}

		var div_10 = $.sibling(node_1, 4);
		var div_11 = $.sibling($.child(div_10), 2);
		var div_12 = $.sibling($.child(div_11), 2);

		$.reset(div_11);
		$.reset(div_10);
		$.reset(div_8);
		$.template_effect(() => $.set_style(div_12, `width: ${[70, 55, 65][index] ?? ''}%`));
		$.append($$anchor, div_8);
	});

	$.reset(div_7);

	var div_13 = $.sibling(div_7, 2);

	$.each(div_13, 20, () => [0, 1, 2], $.index, ($$anchor, _, index) => {
		var div_14 = root_3();
		var div_15 = $.sibling($.child(div_14), 2);
		var div_16 = $.sibling($.child(div_15), 2);

		$.reset(div_15);
		$.reset(div_14);
		$.template_effect(() => $.set_style(div_16, `width: ${[60, 75, 50][index] ?? ''}%`));
		$.append($$anchor, div_14);
	});

	$.reset(div_13);
	$.reset(div_6);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}