import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<div class="relative flex flex-col pb-6 before:absolute before:top-[14px] before:bottom-[-16px] before:left-[3px] before:w-[2px] before:bg-[var(--color-header)] before:content-[''] last:pb-0 last:before:content-none md:grid md:grid-cols-[auto_1fr] md:items-start md:justify-items-start md:gap-4"><div class="flex items-center"><span class="relative z-10 h-2 w-2 rounded-full bg-[var(--color-header)]"></span> <span class="ml-2 pl-2 text-2xl font-bold text-[var(--color-header)]"> </span></div> <div class="mt-2 pl-6 md:mt-0 md:pl-0"><span class="text-sm text-gray-700 dark:text-gray-300" dir="auto"></span></div></div>`);
var root_1 = $.from_html(`<div class="mb-8"><h3 class="mb-4 text-2xl font-bold text-gray-700 dark:text-gray-300"> </h3> <!></div>`);

export default function OnThisDayEventTimeline($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var h3 = $.child(div);
	var text = $.only_child(h3, true);
	var node = $.sibling(h3, 2);

	$.each(node, 17, () => $$props.events, $.index, ($$anchor, event) => {
		var div_1 = root();
		var div_2 = $.child(div_1);
		var span = $.sibling($.child(div_2), 2);
		var text_1 = $.only_child(span, true);

		$.reset(div_2);

		var div_3 = $.sibling(div_2, 2);
		var span_1 = $.child(div_3);

		$.html(span_1, () => $.get(event).content.replace(/href=/g, 'class="underline text-gray-800 hover:text-gray-600 cursor-pointer transition-colors dark:text-gray-200 dark:hover:text-gray-400" href='), true);
		$.reset(span_1);
		$.reset(div_3);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_text(text_1, $.get(event).year);
			span_1.dir = span_1.dir;
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(($0) => $.set_text(text, $0), [() => s("onthisday.events") || "Events"]);
	$.append($$anchor, div);
	$.pop();
}