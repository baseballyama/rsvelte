import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="flex justify-between"><span class="text-muted-foreground"> </span> <span> </span></div>`);
var root_1 = $.from_html(`<div class="h-[150px] shrink-0 overflow-y-auto border-t p-4"><h3 class="text-muted-foreground mb-2 text-xs font-semibold uppercase"> </h3> <div class="flex flex-col gap-3 text-sm"></div></div>`);

export default function InfoList($$anchor, $$props) {
	var div = root_1();
	var h3 = $.child(div);
	var text = $.only_child(h3, true);
	var div_1 = $.sibling(h3, 2);

	$.each(div_1, 21, () => $$props.items, (item) => item.label, ($$anchor, item) => {
		var div_2 = root();
		var span = $.child(div_2);
		var text_1 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_2 = $.only_child(span_1, true);

		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text_1, $.get(item).label);
			$.set_text(text_2, $.get(item).value);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.title));
	$.append($$anchor, div);
}