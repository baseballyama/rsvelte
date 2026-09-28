import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronLeft from "$lib/icons/chevron-left.svelte";
import ChevronRight from "$lib/icons/chevron-right.svelte";

var root = $.from_html(`<a class="group"><div class="flex items-center gap-x-2"><div class="h-[20px] w-[20px]"></div> <div class="text-kui-light-gray-900 group-hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:group-hover:text-kui-dark-gray-1000 mb-[2px] text-[13px] leading-[13px] font-normal capitalize transition-colors">previous</div></div> <div class="flex items-center gap-x-2"><div class="text-kui-light-gray-900 group-hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:group-hover:text-kui-dark-gray-1000 flex h-[20px] w-[20px] items-center justify-center transition-colors"><div class="h-4 w-4"><!></div></div> <span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-[16px] leading-6 font-medium capitalize"> </span></div></a>`);
var root_1 = $.from_html(`<a class="group"><div class="flex items-center gap-x-2"><div class="text-kui-light-gray-900 group-hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:group-hover:text-kui-dark-gray-1000 mb-[2px] text-[13px] leading-[13px] font-normal capitalize transition-colors">next</div> <div class="h-[20px] w-[20px]"></div></div> <div class="flex items-center gap-x-2"><span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-[16px] leading-6 font-medium capitalize"> </span> <div class="text-kui-light-gray-900 group-hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:group-hover:text-kui-dark-gray-1000 flex h-[20px] w-[20px] items-center justify-center transition-colors"><div class="h-4 w-4"><!></div></div></div></a>`);
var root_2 = $.from_html(`<section class="w-full"><nav aria-label="pagination"><!> <!></nav></section>`);

export default function Pagination($$anchor, $$props) {
	$.push($$props, true);

	const prevSnip = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var a = root();
				var div = $.sibling($.child(a), 2);
				var div_1 = $.child(div);
				var div_2 = $.child(div_1);
				var node_1 = $.child(div_2);

				ChevronLeft(node_1, {});
				$.reset(div_2);
				$.reset(div_1);

				var span = $.sibling(div_1, 2);
				var text = $.only_child(span, true);

				$.reset(div);
				$.reset(a);

				$.template_effect(() => {
					$.set_attribute(a, 'aria-label', `go to previous page: ${previous().title ?? ''}`);
					$.set_attribute(a, 'href', previous().href);
					$.set_text(text, previous().title);
				});

				$.append($$anchor, a);
			};

			$.if(node, ($$render) => {
				if (previous()) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	const nextSnip = ($$anchor) => {
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				var a_1 = root_1();
				var div_3 = $.sibling($.child(a_1), 2);
				var span_1 = $.child(div_3);
				var text_1 = $.only_child(span_1, true);
				var div_4 = $.sibling(span_1, 2);
				var div_5 = $.child(div_4);
				var node_3 = $.child(div_5);

				ChevronRight(node_3, {});
				$.reset(div_5);
				$.reset(div_4);
				$.reset(div_3);
				$.reset(a_1);

				$.template_effect(() => {
					$.set_attribute(a_1, 'aria-label', `go to next page: ${next().title ?? ''}`);
					$.set_attribute(a_1, 'href', next().href);
					$.set_text(text_1, next().title);
				});

				$.append($$anchor, a_1);
			};

			$.if(node_2, ($$render) => {
				if (next()) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	};

	let previous = $.prop($$props, 'previous', 3, undefined),
		next = $.prop($$props, 'next', 3, undefined);

	let paginationStyle = $.derived(() => {
		if (previous() && next()) {
			return "justify-between";
		} else if (previous()) {
			return "justify-start";
		} else if (next()) {
			return "justify-end";
		} else {
			return "";
		}
	});

	var section = root_2();
	var nav = $.child(section);
	var node_4 = $.child(nav);

	prevSnip(node_4);

	var node_5 = $.sibling(node_4, 2);

	nextSnip(node_5);
	$.reset(nav);
	$.reset(section);
	$.template_effect(() => $.set_class(nav, 1, `flex w-full items-center ${$.get(paginationStyle) ?? ''} gap-x-4`));
	$.append($$anchor, section);
	$.pop();
}