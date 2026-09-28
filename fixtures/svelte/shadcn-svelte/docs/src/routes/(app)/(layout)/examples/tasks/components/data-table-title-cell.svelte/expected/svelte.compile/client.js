import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { labels } from "../data/data.js";

var root = $.from_html(`<div class="flex space-x-2"><!> <span class="max-w-[500px] truncate font-medium"> </span></div>`);

export default function Data_table_title_cell($$anchor, $$props) {
	$.push($$props, true);

	const label = $.derived(() => labels.find((l) => l.value === $$props.labelValue));
	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Badge($$anchor, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(label).label));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(label)) $$render(consequent);
		});
	}

	var span = $.sibling(node, 2);
	var text_1 = $.only_child(span, true);

	$.reset(div);
	$.template_effect(() => $.set_text(text_1, $$props.value));
	$.append($$anchor, div);
	$.pop();
}