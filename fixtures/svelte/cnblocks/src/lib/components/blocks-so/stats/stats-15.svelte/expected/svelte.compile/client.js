import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var root = $.from_html(`<li class="flex items-center justify-between py-3"><span class="text-muted-foreground"> </span> <span class="flex items-center gap-3 tabular-nums"><span class="text-right font-medium text-foreground"> </span> <span class="h-5 w-px bg-border" aria-hidden="true"></span> <span> </span></span></li>`);
var root_1 = $.from_html(`<div class="w-full max-w-2xs"><h3 class="text-sm font-medium text-foreground">Investment growth projection</h3> <ul role="list" class="mt-2 divide-y divide-border text-sm"></ul></div>`);

export default function Stats_15($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ label: "After 1 year", value: "$2,400", percentage: "+8.2%" },
		{
			label: "After 5 years",
			value: "$14,800",
			percentage: "+24.6%"
		},

		{
			label: "After 10 years",
			value: "$38,500",
			percentage: "+52.1%"
		}
	];

	var div = root_1();
	var ul = $.sibling($.child(div), 2);

	$.each(ul, 21, () => data, $.index, ($$anchor, item) => {
		var li = root();
		var span = $.child(li);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var span_2 = $.child(span_1);
		var text_1 = $.only_child(span_2, true);
		var span_3 = $.sibling(span_2, 4);
		var text_2 = $.only_child(span_3, true);

		$.reset(span_1);
		$.reset(li);

		$.template_effect(
			($0) => {
				$.set_text(text, $.get(item).label);
				$.set_text(text_1, $.get(item).value);
				$.set_class(span_3, 1, $0);
				$.set_text(text_2, $.get(item).percentage);
			},
			[
				() => $.clsx(cn("w-15 rounded px-1.5 py-1 text-center text-xs font-semibold", "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"))
			]
		);

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}